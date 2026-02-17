import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PLANS } from "@/lib/razorpay";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature || !verifySignature(body, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    await connectDB();

    if (eventType === "subscription.activated" || eventType === "subscription.charged") {
      const subscription = event.payload.subscription.entity;
      const planId = subscription.plan_id;
      const userId = subscription.notes?.userId;

      if (!userId) {
        console.error("[Webhook] No userId in subscription notes");
        return Response.json({ received: true });
      }

      let plan: "pro" | "team" = "pro";
      if (planId === PLANS.team.razorpayPlanId) {
        plan = "team";
      }

      await User.findByIdAndUpdate(userId, {
        plan,
        subscriptionStatus: "active",
        razorpaySubscriptionId: subscription.id,
        subscriptionCurrentPeriodEnd: subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null,
      });

      console.log(`[Webhook] User ${userId} activated: ${plan}`);
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.completed") {
      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          plan: "free",
          subscriptionStatus: "cancelled",
        });
        console.log(`[Webhook] User ${userId} cancelled`);
      }
    }

    if (eventType === "subscription.paused") {
      const subscription = event.payload.subscription.entity;
      const userId = subscription.notes?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          subscriptionStatus: "cancelled",
          plan: "free",
        });
        console.log(`[Webhook] User ${userId} paused → free`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
