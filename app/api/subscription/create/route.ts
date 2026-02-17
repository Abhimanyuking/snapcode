import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getRazorpay, PLANS, type PlanKey } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Please sign in first" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanKey];

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === plan && user.subscriptionStatus === "active") {
      return Response.json({ error: "You are already on this plan" }, { status: 400 });
    }

    const subscription = await getRazorpay().subscriptions.create({
      plan_id: selectedPlan.razorpayPlanId,
      total_count: 12,
      customer_notify: 1,
      notes: {
        userId: session.user.id,
        plan: plan,
        email: user.email,
      },
    });

    user.razorpaySubscriptionId = subscription.id;
    user.subscriptionStatus = "pending";
    await user.save();

    return Response.json({
      subscriptionId: subscription.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: user.name,
      email: user.email,
      plan: selectedPlan.name,
      amount: selectedPlan.price,
    });
  } catch (error) {
    console.error("[API /subscription/create]", error);
    return Response.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
