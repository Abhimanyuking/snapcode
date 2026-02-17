import { headers } from "next/headers";
import { generateFromImages } from "@/lib/groq";
import { SYSTEM_PROMPT, VALID_FRAMEWORKS, VALID_MIMES, FRAMEWORK_LABELS } from "@/lib/prompts";
import { cleanCode, addWatermark } from "@/lib/utils";
import { rateLimit, dailyLimitCheck, dailyLimitIncrement, isFrameworkFree } from "@/lib/rateLimit";
import { getAuthContext } from "@/lib/authCheck";
import { canUseFramework } from "@/lib/plans";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image in base64
const MAX_IMAGES = 5;

export async function POST(req: Request) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-real-ip") ||
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const contentType = headersList.get("content-type");
    if (!contentType?.includes("application/json")) {
      return Response.json(
        { error: "Content-Type must be application/json", success: false },
        { status: 415 }
      );
    }

    const { allowed, remaining } = rateLimit(ip);
    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Please wait a minute and try again.", success: false },
        { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
      );
    }

    // Auth-aware daily limit
    const authCtx = await getAuthContext(headersList);

    if (authCtx.isAuthenticated && authCtx.userId) {
      // Authenticated: check DB-based daily limit
      await connectDB();
      const user = await User.findById(authCtx.userId);
      if (user) {
        const now = new Date();
        if (user.dailyGenerationsResetAt && now > user.dailyGenerationsResetAt) {
          user.dailyGenerations = 0;
          const nextMidnight = new Date();
          nextMidnight.setDate(nextMidnight.getDate() + 1);
          nextMidnight.setHours(0, 0, 0, 0);
          user.dailyGenerationsResetAt = nextMidnight;
          await user.save();
        }
        if (authCtx.limits.dailyLimit !== Infinity && user.dailyGenerations >= authCtx.limits.dailyLimit) {
          return Response.json(
            { error: "Daily limit reached. Upgrade to Pro for unlimited conversions!", success: false },
            { status: 429 }
          );
        }
      }
    } else {
      // Anonymous: IP-based daily limit
      const daily = dailyLimitCheck(ip);
      if (!daily.allowed) {
        return Response.json(
          { error: "You've used all 10 free conversions for today. Sign up or come back tomorrow!", success: false },
          { status: 429, headers: { "X-Daily-Remaining": "0" } }
        );
      }
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body", success: false },
        { status: 400 }
      );
    }

    const { images, framework } = body;

    // Support both old single-image format and new multi-image format
    let imageList: { mimeType: string; data: string }[];

    if (Array.isArray(images)) {
      imageList = images;
    } else if (body.image && body.mimeType) {
      // Backwards compatible: single image
      imageList = [{ mimeType: body.mimeType, data: body.image }];
    } else {
      return Response.json({ error: "No images provided", success: false }, { status: 400 });
    }

    if (imageList.length === 0 || imageList.length > MAX_IMAGES) {
      return Response.json({ error: `Upload 1 to ${MAX_IMAGES} screenshots.`, success: false }, { status: 400 });
    }

    for (const img of imageList) {
      if (!img.data || typeof img.data !== "string") {
        return Response.json({ error: "Invalid image data", success: false }, { status: 400 });
      }
      if (img.data.length > MAX_IMAGE_SIZE) {
        return Response.json({ error: "One or more images too large. Max 10MB each.", success: false }, { status: 400 });
      }
      if (!img.mimeType || !VALID_MIMES.includes(img.mimeType as typeof VALID_MIMES[number])) {
        return Response.json({ error: "Only PNG, JPG, and WEBP images are supported.", success: false }, { status: 400 });
      }
    }

    if (framework && !VALID_FRAMEWORKS.includes(framework)) {
      return Response.json({ error: "Invalid framework selected.", success: false }, { status: 400 });
    }

    // Plan-based framework check
    if (framework && !canUseFramework(authCtx.plan, framework)) {
      return Response.json(
        { error: "React & Next.js are Pro features. Upgrade to Pro to unlock all frameworks!", success: false },
        { status: 403 }
      );
    }

    let prompt = SYSTEM_PROMPT.replaceAll("{framework}", FRAMEWORK_LABELS[framework] || "HTML + Tailwind CSS");

    if (imageList.length > 1) {
      prompt += `\n\nYou are receiving ${imageList.length} screenshots. These are different sections/pages of the same website or app. Combine ALL of them into ONE single, complete, cohesive code file. Make sure every section from every screenshot is included in the final output.`;
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        const err = new Error("Request timed out");
        err.name = "AbortError";
        reject(err);
      }, 120000); // 2 min for multi-image
    });

    const rawCode = await Promise.race([
      generateFromImages(prompt, imageList),
      timeoutPromise,
    ]);

    if (!rawCode || rawCode.trim().length === 0) {
      return Response.json(
        { error: "AI returned empty response. Try again.", success: false },
        { status: 422 }
      );
    }

    const cleaned = cleanCode(rawCode);
    const code = authCtx.limits.watermark ? addWatermark(cleaned) : cleaned;

    // Increment usage
    if (authCtx.isAuthenticated && authCtx.userId) {
      await connectDB();
      await User.findByIdAndUpdate(authCtx.userId, { $inc: { dailyGenerations: 1 } });
    } else {
      dailyLimitIncrement(ip);
    }

    return Response.json(
      { code, success: true },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[API /generate]", msg);
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json({ error: "Request timed out. Please try again.", success: false }, { status: 504 });
    }
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests") || msg.includes("rate_limit")) {
      return Response.json({ error: "AI rate limit reached. Please wait a minute and try again.", success: false }, { status: 429 });
    }
    return Response.json({ error: "Failed to generate code. Please try again.", success: false }, { status: 500 });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
