import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — SnapCode",
  description: "Simple, transparent pricing. Start free with 10 conversions per day. No hidden fees, cancel anytime.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
