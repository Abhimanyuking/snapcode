"use client";

import { useState, useRef, useEffect } from "react";

interface QuickEditChipsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  "Make it responsive",
  "Add dark mode",
  "Add hover effects",
  "Add a footer",
  "Change colors",
];

export default function QuickEditChips({ onSelect }: QuickEditChipsProps) {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (s: string) => {
    setActiveChip(s);
    onSelect(s);
    timerRef.current = setTimeout(() => setActiveChip(null), 600);
  };

  return (
    <div role="group" aria-label="Quick edit suggestions" className="flex flex-nowrap md:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => handleClick(s)}
          aria-label={`Apply edit: ${s}`}
          className={`flex-shrink-0 px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs text-gray-500 bg-[#111] border border-[#1e1e1e] hover:text-gray-300 hover:border-[#333] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#a855f7] focus-visible:outline-offset-1 ${
            activeChip === s ? "text-[#a855f7] border-[#a855f7]/30 bg-[#a855f7]/15" : ""
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
