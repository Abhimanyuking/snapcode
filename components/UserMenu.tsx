"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, Crown, User } from "lucide-react";
import Link from "next/link";

const planColors: Record<string, string> = {
  pro: "from-[#a855f7] to-[#ec4899]",
  team: "from-[#ec4899] to-[#f472b6]",
  free: "from-gray-500 to-gray-600",
};

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session?.user) return null;

  const { name, email, plan } = session.user;
  const initial = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || "U";
  const gradient = planColors[plan] || planColors.free;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200 min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-semibold`}>
          {session.user.image ? (
            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            initial
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                  {plan === "free" ? <User className="w-2.5 h-2.5" /> : <Crown className="w-2.5 h-2.5" />}
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </span>
              </div>
            </div>

            <div className="py-1">
              {plan === "free" && (
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#a855f7] hover:bg-white/5 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
