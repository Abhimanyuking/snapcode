"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Code2 } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#a855f7]/5 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#ec4899]/5 blur-3xl animate-float-reverse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center card-v7 rounded-[20px] p-8 sm:p-12 max-w-md w-full relative"
      >
        <div className="text-6xl sm:text-8xl font-bold gradient-text mb-4">404</div>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          This page doesn&apos;t exist. Maybe it was moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white btn-v6-primary btn-text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back home
        </Link>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600">
          <Code2 className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>SnapCode v15</span>
        </div>
      </motion.div>
    </div>
  );
}
