import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getPlanLimits, type PlanType } from "@/lib/plans";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select(
      "plan dailyGenerations dailyGenerationsResetAt subscriptionStatus"
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Reset daily count if past midnight
    const now = new Date();
    if (user.dailyGenerationsResetAt && now > user.dailyGenerationsResetAt) {
      user.dailyGenerations = 0;
      const nextMidnight = new Date();
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
      user.dailyGenerationsResetAt = nextMidnight;
      await user.save();
    }

    const limits = getPlanLimits(user.plan as PlanType);

    return Response.json({
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      dailyGenerations: user.dailyGenerations,
      dailyLimit: limits.dailyLimit,
      editLimit: limits.editLimit,
      allFrameworks: limits.allFrameworks,
      watermark: limits.watermark,
    });
  } catch (error) {
    console.error("[API /user/usage]", error);
    return Response.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
