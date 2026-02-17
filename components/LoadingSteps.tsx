"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, Scan, Palette, Code2, Sparkles } from "lucide-react";

const steps = [
  { text: "Analyzing layout structure...", icon: Scan, duration: 1500 },
  { text: "Detecting colors & typography...", icon: Palette, duration: 1500 },
  { text: "Generating responsive code...", icon: Code2, duration: 2500 },
  { text: "Optimizing for production...", icon: Sparkles, duration: 1500 },
];

interface LoadingStepsProps {
  imagePreview: string | null;
}

export default function LoadingSteps({ imagePreview }: LoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let accumulated = 0;

    steps.forEach((step, index) => {
      if (index > 0) {
        accumulated += steps[index - 1].duration;
        timers.push(
          setTimeout(() => setCurrentStep(index), accumulated)
        );
      }
    });

    // Smooth progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 0.5, 95));
    }, 70);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5 min-[390px]:gap-6 sm:gap-8 md:gap-10 px-3 min-[390px]:px-4 sm:px-6 relative">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient-loading pointer-events-none" />

      {/* Orb animation */}
      <div className="relative z-10">
        {/* Outer glow rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-6 min-[390px]:-inset-8 sm:-inset-12 md:-inset-16 rounded-full bg-[#a855f7]/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.05, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -inset-4 min-[390px]:-inset-6 sm:-inset-8 md:-inset-10 rounded-full bg-[#a855f7]/10 blur-2xl"
        />

        {/* Screenshot with animated border */}
        {imagePreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Floating particle dots around the screenshot */}
            <div className="absolute -top-3 -right-3 w-2 h-2 rounded-full bg-[#a855f7]" style={{ animationName: 'particle-float-1', animationDuration: '4s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} aria-hidden="true" />
            <div className="absolute -bottom-2 -left-4 w-1.5 h-1.5 rounded-full bg-[#ec4899]" style={{ animationName: 'particle-float-2', animationDuration: '5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} aria-hidden="true" />
            <div className="absolute top-1/2 -right-5 w-1.5 h-1.5 rounded-full bg-[#818cf8]" style={{ animationName: 'particle-float-3', animationDuration: '4.5s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} aria-hidden="true" />
            <div className="absolute -top-4 left-1/3 w-1 h-1 rounded-full bg-[#c084fc]" style={{ animationName: 'particle-float-4', animationDuration: '6s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }} aria-hidden="true" />

            <div className="card-v7-gradient-border">
              <img
                src={imagePreview}
                alt="Processing"
                className="w-32 min-[390px]:w-36 sm:w-48 md:w-56 h-auto max-h-[30vh] sm:max-h-[35vh] rounded-[14px] sm:rounded-[18px] md:rounded-[20px] object-contain"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 min-[390px]:w-24 min-[390px]:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-[#a855f7]/30 border-t-[#a855f7] flex items-center justify-center"
          >
            <Code2 className="w-8 h-8 min-[390px]:w-10 min-[390px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-[#a855f7]" />
          </motion.div>
        )}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-1.5 min-[390px]:gap-2 sm:gap-2.5 md:gap-3 w-full max-w-[320px] min-[390px]:max-w-sm relative z-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100, damping: 15 }}
              className={`flex items-center gap-2 min-[390px]:gap-2.5 sm:gap-3 px-2.5 min-[390px]:px-3 sm:px-4 py-2 sm:py-2.5 rounded-[12px] sm:rounded-[16px] transition-all duration-500 ${
                isCurrent
                  ? "bg-[#a855f7]/10 border border-[#a855f7]/20 animate-breathing-glow"
                  : isComplete
                  ? "bg-[#ec4899]/5"
                  : ""
              }`}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ec4899]/20 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ec4899]" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      key="loader"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#a855f7] animate-spin" />
                    </motion.div>
                  ) : (
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  )}
                </AnimatePresence>
              </div>
              <span
                aria-live="polite"
                className={`relative text-[11px] min-[390px]:text-xs sm:text-sm font-medium transition-colors duration-500 ${
                  isCurrent ? "text-white" : isComplete ? "text-gray-500" : "text-gray-600"
                }`}
              >
                {step.text}
                {isComplete && (
                  <motion.span
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.3 } }}
                    className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-gradient-to-r from-gray-500 via-gray-400 to-transparent origin-left rounded-full"
                  />
                )}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[320px] min-[390px]:max-w-sm relative z-10">
        <div className="flex justify-between text-[11px] min-[390px]:text-xs text-gray-500 mb-1.5 sm:mb-2">
          <span>Generating...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          className="relative w-full h-1.5 sm:h-2 bg-[#18181b] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Generation progress"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#a855f7] to-[#ec4899] progress-glow"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
