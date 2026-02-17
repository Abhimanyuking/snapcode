import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getPlanLimits, type PlanType } from "@/lib/plans";

export interface AuthContext {
  isAuthenticated: boolean;
  userId: string | null;
  plan: PlanType;
  limits: ReturnType<typeof getPlanLimits>;
  ip: string;
}

export async function getAuthContext(headersList: Headers): Promise<AuthContext> {
  const ip =
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  try {
    const session = await auth();

    if (session?.user?.id) {
      await connectDB();
      const user = await User.findById(session.user.id).select("plan").lean();
      const plan = (user?.plan as PlanType) || "free";

      return {
        isAuthenticated: true,
        userId: session.user.id,
        plan,
        limits: getPlanLimits(plan),
        ip,
      };
    }
  } catch {
    // Auth failed, fall through to anonymous
  }

  return {
    isAuthenticated: false,
    userId: null,
    plan: "free",
    limits: getPlanLimits("free"),
    ip,
  };
}
