"use client";

import { motion } from "framer-motion";
import { Check, Zap, Sparkles, ArrowRight, Crown, Clock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/Footer";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Try SnapCode — no signup needed",
    features: [
      "10 conversions per day",
      "HTML + Tailwind CSS",
      "Clean, working code",
      "3 AI edits per conversion",
      "Copy & Download",
      "Community support",
    ],
    highlighted: false,
    comingSoon: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For serious developers & freelancers",
    features: [
      "Unlimited conversions",
      "All 3 frameworks",
      "Optimized, production-ready code",
      "Unlimited AI edits",
      "No watermark",
      "CodeSandbox & StackBlitz",
      "Custom branding on shares",
      "Email support",
    ],
    highlighted: true,
    comingSoon: true,
  },
  {
    key: "team" as const,
    name: "Team",
    price: "₹2,499",
    period: "/month",
    description: "For teams & agencies",
    features: [
      "Everything in Pro",
      "All 3 + Custom frameworks",
      "API access",
      "Figma plugin & GitHub push",
      "White-label share links",
      "Priority + Slack support",
      "Team dashboard",
    ],
    highlighted: false,
    comingSoon: true,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const userPlan = session?.user?.plan || "free";

  const isCurrentPlan = (planKey: string) => {
    return status === "authenticated" && userPlan === planKey;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedBackground />

      {/* Floating decorative orbs */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute rounded-full orb-float-1"
          style={{
            top: '5%',
            right: '15%',
            width: 'clamp(150px, 25vw, 300px)',
            height: 'clamp(150px, 25vw, 300px)',
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute rounded-full orb-float-2"
          style={{
            bottom: '20%',
            left: '10%',
            width: 'clamp(120px, 20vw, 250px)',
            height: 'clamp(120px, 20vw, 250px)',
            background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute rounded-full orb-float-3"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'clamp(100px, 18vw, 200px)',
            height: 'clamp(100px, 18vw, 200px)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative z-10 py-12 sm:py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14 md:mb-20"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full mb-4 sm:mb-6 border border-[#a855f7]/20 tracking-widest badge-v7">
              <Sparkles className="w-3 h-3" />
              PRICING
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-5">
              Simple, transparent{" "}
              <span className="gradient-text">pricing</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel
              anytime.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative group card-v7 card-v7-float rounded-[20px] overflow-hidden ${
                  plan.highlighted ? "md:-mt-4 md:mb-0 gradient-border-animated card-v7-active" : ""
                }`}
              >
                {/* Gradient border for highlighted */}
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7] via-[#a855f7] to-[#ec4899] rounded-2xl opacity-50 blur-sm group-hover:opacity-75 transition-opacity" />
                )}

                <div
                  className={`relative h-full glass rounded-[20px] p-5 sm:p-6 md:p-8 flex flex-col ${
                    plan.highlighted ? "border-[#a855f7]/30" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 popular-badge-shine badge-v7 text-white text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-b-xl tracking-wider">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4 sm:mb-6 pt-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-semibold tracking-wide">{plan.name}</h2>
                      {isCurrentPlan(plan.key) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                          <Crown className="w-2.5 h-2.5" />
                          Current
                        </span>
                      )}
                      {plan.comingSoon && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
                          <Clock className="w-2.5 h-2.5" />
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <span className={`text-4xl sm:text-5xl font-bold ${plan.highlighted ? 'gradient-text' : ''}`}>{plan.price}</span>
                    <span className="text-gray-500 ml-1 text-sm sm:text-base align-baseline">{plan.period}</span>
                  </div>

                  {plan.key === "free" ? (
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 sm:py-4 mb-6 sm:mb-8 bg-[#27272a] hover:bg-[#333] text-gray-200 border border-[#3f3f46] btn-v6-secondary btn-text-base"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className={`flex items-center justify-center gap-2.5 w-full py-3.5 sm:py-4 mb-6 sm:mb-8 opacity-60 cursor-not-allowed ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white btn-v6-primary btn-text-base"
                          : "bg-[#27272a] text-gray-200 border border-[#3f3f46] btn-v6-secondary btn-text-base"
                      }`}
                    >
                      Coming Soon
                    </button>
                  )}

                  <ul className="space-y-2.5 sm:space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-400"
                      >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 text-[#a855f7]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQ-like note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10 sm:mt-16 text-xs sm:text-sm text-gray-500"
          >
            All plans use Llama AI to generate code.
            <br />
            Free tier available now — Pro & Team coming soon.
          </motion.div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
}
