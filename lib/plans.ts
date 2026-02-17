export type PlanType = "free" | "pro" | "team";

export function getPlanLimits(plan: PlanType) {
  switch (plan) {
    case "pro":
      return { dailyLimit: Infinity, editLimit: Infinity, allFrameworks: true, watermark: false };
    case "team":
      return { dailyLimit: Infinity, editLimit: Infinity, allFrameworks: true, watermark: false };
    default:
      return { dailyLimit: 10, editLimit: 3, allFrameworks: false, watermark: true };
  }
}

export function canUseFramework(plan: PlanType, framework: string): boolean {
  if (plan === "pro" || plan === "team") return true;
  return framework === "html-tailwind";
}
