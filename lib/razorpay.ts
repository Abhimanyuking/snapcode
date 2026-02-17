import Razorpay from "razorpay";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return _razorpay;
}

export const PLANS = {
  pro: {
    name: "Pro",
    price: 499,
    currency: "INR",
    period: "monthly",
    get razorpayPlanId() { return process.env.RAZORPAY_PLAN_ID_PRO!; },
  },
  team: {
    name: "Team",
    price: 2499,
    currency: "INR",
    period: "monthly",
    get razorpayPlanId() { return process.env.RAZORPAY_PLAN_ID_TEAM!; },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
