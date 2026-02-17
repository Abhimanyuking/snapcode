"use client";

import { FRAMEWORK_LABELS } from "@/lib/prompts";
import { Lock } from "lucide-react";

interface FrameworkSelectorProps {
  selected: string;
  onChange: (framework: string) => void;
  isPro?: boolean;
}

const frameworks = Object.keys(FRAMEWORK_LABELS);

const descriptions: Record<string, string> = {
  "html-tailwind": "Simple website",
  "react-tailwind": "React app",
  nextjs: "React + routing",
};

const labels: Record<string, string> = {
  "html-tailwind": "HTML + Tailwind",
  "react-tailwind": "React",
  nextjs: "Next.js",
};

// Free tier only allows html-tailwind
const FREE_FRAMEWORKS = ["html-tailwind"];

// Selected = white, Unselected = purple/pink theme
const selectedStyle = {
  color: "#e2e8f0",
  bg: "rgba(226,232,240,0.08)",
  border: "rgba(226,232,240,0.25)",
  glow: "0 0 20px rgba(226,232,240,0.15), inset 0 1px 0 rgba(226,232,240,0.08)",
};
const unselectedStyle = {
  color: "#a855f7",
  hoverBg: "rgba(168,85,247,0.08)",
  hoverBorder: "rgba(168,85,247,0.35)",
  hoverGlow: "0 0 12px rgba(168,85,247,0.15)",
};

export default function FrameworkSelector({ selected, onChange, isPro = false }: FrameworkSelectorProps) {
  return (
    <div className="relative">
    <div
      role="radiogroup"
      aria-label="Select code framework"
      className="flex items-stretch justify-start sm:justify-center gap-2 min-[390px]:gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 sm:pb-0 sm:flex-wrap pr-8 sm:pr-0 -mx-1 px-1 sm:mx-0 sm:px-0"
      onKeyDown={(e) => {
        const fws = frameworks;
        const idx = fws.indexOf(selected);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = fws[(idx + 1) % fws.length];
          if (isPro || FREE_FRAMEWORKS.includes(next)) onChange(next);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prev = fws[(idx - 1 + fws.length) % fws.length];
          if (isPro || FREE_FRAMEWORKS.includes(prev)) onChange(prev);
        }
      }}
    >
      {frameworks.map((fw) => {
        const isSelected = selected === fw;
        const isLocked = !isPro && !FREE_FRAMEWORKS.includes(fw);
        const s = selectedStyle;
        const u = unselectedStyle;
        return (
          <button
            key={fw}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isLocked}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              if (!isLocked) onChange(fw);
            }}
            className={`snap-start flex-shrink-0 flex flex-col items-center px-3 min-[390px]:px-4 sm:px-5 py-2.5 sm:py-3 min-h-[48px] sm:min-h-[52px] rounded-xl transition-all duration-200 relative touch-manipulation ${
              isLocked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={isSelected && !isLocked ? {
              background: s.bg,
              border: `1px solid ${s.border}`,
              boxShadow: s.glow,
              color: s.color,
            } : {
              background: "#18181b",
              border: "1px solid rgba(168,85,247,0.1)",
              color: isLocked ? "#6b7280" : u.color,
            }}
            onMouseEnter={(e) => {
              if (!isSelected && !isLocked) {
                e.currentTarget.style.borderColor = u.hoverBorder;
                e.currentTarget.style.background = u.hoverBg;
                e.currentTarget.style.boxShadow = u.hoverGlow;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected && !isLocked) {
                e.currentTarget.style.borderColor = "rgba(168,85,247,0.1)";
                e.currentTarget.style.background = "#18181b";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <span className="flex items-center gap-1 min-[390px]:gap-1.5 text-[13px] min-[390px]:text-sm font-medium whitespace-nowrap">
              {labels[fw]}
              {isLocked ? (
                <span className="flex items-center gap-0.5 text-[9px] min-[390px]:text-[10px] font-medium px-1 min-[390px]:px-1.5 py-px rounded-full bg-[#27272a] text-gray-500">
                  <Lock className="w-2.5 h-2.5" />
                  Pro
                </span>
              ) : fw === "html-tailwind" ? (
                <span
                  className="text-[9px] min-[390px]:text-[10px] font-medium px-1 min-[390px]:px-1.5 py-px rounded-full"
                  style={{
                    background: isSelected ? "rgba(226,232,240,0.2)" : "rgba(168,85,247,0.2)",
                    color: isSelected ? s.color : u.color,
                  }}
                >
                  Free
                </span>
              ) : null}
            </span>
            <span
              className="text-[11px] min-[390px]:text-xs mt-0.5 transition-colors duration-200 whitespace-nowrap"
              style={{ color: isLocked ? "#4b5563" : isSelected ? "rgba(226,232,240,0.7)" : "rgba(168,85,247,0.5)" }}
            >
              {descriptions[fw]}
            </span>
          </button>
        );
      })}
    </div>
    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-black via-black/60 to-transparent pointer-events-none sm:hidden" />
    </div>
  );
}
