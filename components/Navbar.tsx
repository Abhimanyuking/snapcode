"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Menu, X, Sparkles, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isActive = useCallback((href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href;
  }, [pathname]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when drawer opens
  useEffect(() => {
    if (mobileOpen) {
      // Small delay to allow animation to start
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [mobileOpen]);

  return (
    <>
      {/* ── Main Navbar ── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-lg shadow-black/20"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-3 min-[390px]:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-h-[44px]">
              <div className="relative">
                <div className="relative bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] p-1.5 rounded-xl">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8V5.5C3 4.12 4.12 3 5.5 3H8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M16 3h2.5C19.88 3 21 4.12 21 5.5V8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M3 16v2.5C3 19.88 4.12 21 5.5 21H8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M16 21h2.5c1.38 0 2.5-1.12 2.5-2.5V16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M10.5 8.5L7 12l3.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.5 8.5L17 12l-3.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold hidden min-[340px]:inline">
                Snap<span className="gradient-text navbar-text-glow">Code</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full navbar-v5-badge text-white shadow-sm shadow-purple-500/20">
                <Sparkles className="w-3 h-3" />
                v16
              </span>
            </Link>

            {/* ── Desktop / Tablet Nav ── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`navbar-nav-pill relative text-xs lg:text-sm px-2.5 lg:px-3.5 min-h-[44px] flex items-center tracking-wide rounded-[20px] transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-white bg-white/[0.08]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#6366f1]"
                      style={{
                        boxShadow: "0 0 8px rgba(168, 85, 247, 0.5), 0 0 16px rgba(236, 72, 153, 0.3)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              <a
                href="https://github.com/snapcode-ai/snapcode"
                target="_blank"
                rel="noopener noreferrer"
                className="navbar-nav-pill flex items-center gap-1.5 text-xs lg:text-sm text-gray-400 hover:text-white px-2.5 lg:px-3.5 min-h-[44px] tracking-wide rounded-[20px] transition-all duration-200"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>

            {/* ── CTA + Auth + Mobile Toggle ── */}
            <div className="flex items-center gap-2 sm:gap-3">
              {status === "authenticated" && session?.user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/pricing"
                    className="navbar-shine-btn inline-flex items-center gap-2 font-medium px-4 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white btn-v6-primary btn-text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pricing
                  </Link>
                  <UserMenu />
                </div>
              ) : status === "unauthenticated" ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="navbar-nav-pill flex items-center gap-1.5 text-xs lg:text-sm text-gray-400 hover:text-white px-2.5 lg:px-3.5 min-h-[44px] tracking-wide rounded-[20px] transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/pricing"
                    className="navbar-shine-btn inline-flex items-center gap-2 font-medium px-4 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white btn-v6-primary btn-text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pricing
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/pricing"
                    className="navbar-shine-btn inline-flex items-center gap-2 font-medium px-4 lg:px-5 py-2 lg:py-2.5 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white btn-v6-primary btn-text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Pricing
                  </Link>
                </div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl btn-v6-icon text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all duration-200"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Animated gradient bottom line (visible when scrolled) ── */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="navbar-gradient-line h-[1px] w-full origin-center"
            />
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Mobile Drawer + Backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] max-w-[80vw] min-[414px]:max-w-[85vw] md:hidden flex flex-col"
              style={{
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                paddingRight: "env(safe-area-inset-right, 0px)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  const focusable = e.currentTarget.querySelectorAll("a, button");
                  const first = focusable[0] as HTMLElement;
                  const last = focusable[focusable.length - 1] as HTMLElement;
                  if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                  } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                  }
                }
              }}
            >
              <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/[0.06] rounded-l-[20px]" />

              <div className="relative flex flex-col h-full">
                <div className="navbar-gradient-line h-[2px] w-full shrink-0" />

                <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute -inset-0.5 rounded-md navbar-logo-glow opacity-30 blur-sm" />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
                        <path d="M3 8V5.5C3 4.12 4.12 3 5.5 3H8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M16 3h2.5C19.88 3 21 4.12 21 5.5V8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M3 16v2.5C3 19.88 4.12 21 5.5 21H8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M16 21h2.5c1.38 0 2.5-1.12 2.5-2.5V16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M10.5 8.5L7 12l3.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.5 8.5L17 12l-3.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Snap<span className="gradient-text">Code</span>
                    <span className="inline-flex items-center text-[9px] font-semibold px-1.5 py-px rounded-full navbar-v5-badge text-white">
                      v16
                    </span>
                  </span>
                  <button
                    ref={closeButtonRef}
                    onClick={closeMobile}
                    className="flex items-center justify-center w-11 h-11 rounded-xl btn-v6-icon text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <div className="flex flex-col gap-1">
                    {NAV_LINKS.map((link, i) => (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 + i * 0.03 }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobile}
                          aria-current={isActive(link.href) ? "page" : undefined}
                          className={`flex items-center text-sm min-h-[44px] px-3 py-2.5 tracking-wide rounded-xl transition-all duration-200 ${
                            isActive(link.href)
                              ? "text-white bg-gradient-to-r from-[#a855f7]/10 via-[#ec4899]/5 to-[#6366f1]/10 border border-[#a855f7]/20 navbar-active-glow"
                              : "text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10"
                          }`}
                        >
                          {link.label}
                          {isActive(link.href) && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] shadow-sm shadow-purple-500/50" />
                          )}
                        </Link>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 + NAV_LINKS.length * 0.03 }}
                    >
                      <a
                        href="https://github.com/snapcode-ai/snapcode"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMobile}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white min-h-[44px] px-3 py-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    </motion.div>
                  </div>
                </nav>

                <div className="px-4 pb-5 pt-3 border-t border-white/[0.06]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-2"
                  >
                    {status === "authenticated" && session?.user ? (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {session.user.image ? (
                            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            session.user.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{session.user.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{session.user.email}</p>
                        </div>
                      </div>
                    ) : status === "unauthenticated" ? (
                      <Link
                        href="/login"
                        onClick={closeMobile}
                        className="flex items-center justify-center gap-2.5 w-full min-h-[44px] px-4 py-3 bg-[#18181b] border border-white/[0.06] text-white rounded-xl text-sm font-medium hover:bg-[#222] transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Link>
                    ) : null}
                    <Link
                      href="/pricing"
                      onClick={closeMobile}
                      className="navbar-shine-btn flex items-center justify-center gap-2.5 w-full min-h-[44px] px-4 py-3.5 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white btn-v6-primary btn-text-base"
                    >
                      <Sparkles className="w-4 h-4" />
                      Pricing
                    </Link>
                  </motion.div>
                  <p className="text-[10px] text-gray-500 text-center mt-3">
                    SnapCode v16 &middot; Screenshot to code in seconds
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
