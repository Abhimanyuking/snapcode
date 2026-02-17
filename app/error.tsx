"use client";

import { motion } from "framer-motion";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-red-500/5 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#a855f7]/5 blur-3xl animate-float-reverse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center card-v7 rounded-[20px] p-8 sm:p-12 max-w-md w-full relative"
      >
        <div className="text-4xl sm:text-5xl font-bold text-red-400 mb-3">Oops!</div>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          Something went wrong. Don&apos;t worry, your work isn&apos;t lost.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white btn-v6-primary btn-text-base w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[#18181b] hover:bg-[#27272a] text-gray-300 btn-v6-secondary btn-text-base w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
