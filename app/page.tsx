"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Code2,
  Smartphone,
  Globe,
  Sparkles,
  Layers,
  Clock,
  Shield,
  Upload,
} from "lucide-react";
import DropZone from "@/components/DropZone";
import FrameworkSelector from "@/components/FrameworkSelector";
import LoadingSteps from "@/components/LoadingSteps";
import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/Footer";
import { fileToBase64, getMimeType } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const ROTATING_WORDS = ["Code", "React", "HTML", "Next.js"];

function TypewriterWord({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text === current) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text === "") {
      // Move to next word
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      // Type or delete
      const speed = isDeleting ? 60 : 120;
      timeout = setTimeout(() => {
        setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="gradient-text inline-block min-w-[5.5ch] text-left">
      {text}
      <span className="animate-blink text-[#a855f7]">|</span>
    </span>
  );
}

const FEATURE_GRADIENT_CLASSES = [
  "feature-gradient-1",
  "feature-gradient-2",
  "feature-gradient-3",
  "feature-gradient-4",
  "feature-gradient-5",
  "feature-gradient-6",
];

const HIGHLIGHT_FEATURES = [
  { title: "Instant", label: "Results in seconds" },
  { title: "3+", label: "Frameworks supported" },
  { title: "Free", label: "No signup needed" },
  { title: "AI Powered", label: "Powered by Llama AI" },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Upload",
    desc: "Drag & drop any screenshot — website, app, Figma design, or even a hand-drawn sketch.",
  },
  {
    step: "02",
    title: "AI reads your design",
    desc: "AI analyzes your screenshot and writes clean, responsive code automatically.",
  },
  {
    step: "03",
    title: "Get your code",
    desc: "Copy the code, download as ZIP, or open directly in CodeSandbox / StackBlitz.",
  },
] as const;

const BENTO_FEATURES = [
  { title: "Ready in seconds", desc: "Upload a screenshot, get working code — faster than writing it yourself", span: "lg:col-span-2" },
  { title: "React, HTML & Next.js", desc: "Choose from 3 frameworks — HTML + Tailwind, React, Next.js", span: "lg:col-span-2" },
  { title: "Works on all screens", desc: "Every generated code is responsive — looks great on mobile, tablet & desktop", span: "" },
  { title: "Edit with AI", desc: "Tell AI what to change in plain English — \"make the button bigger\"", span: "" },
  { title: "Paste from clipboard", desc: "Just press Ctrl+V to paste a screenshot — no need to save the file first", span: "" },
  { title: "Clean, usable code", desc: "Get proper HTML with Tailwind CSS classes. Ready to use in your project.", span: "" },
] as const;

const HIGHLIGHT_ICONS = [
  <Zap key="zap" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Code2 key="code2" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Sparkles key="sparkles" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Shield key="shield" className="w-4 h-4 sm:w-5 sm:h-5" />,
];

const HOW_IT_WORKS_ICONS = [
  <Globe key="globe" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
  <Zap key="zap" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
  <Code2 key="code2" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
];

const BENTO_ICONS = [
  <Zap key="zap" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Code2 key="code2" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Smartphone key="smartphone" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Layers key="layers" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Clock key="clock" className="w-4 h-4 sm:w-5 sm:h-5" />,
  <Shield key="shield" className="w-4 h-4 sm:w-5 sm:h-5" />,
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const isPro = session?.user?.plan === "pro" || session?.user?.plan === "team";
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [framework, setFramework] = useState("html-tailwind");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [shortcutKey, setShortcutKey] = useState("Ctrl");

  // Detect touch device and platform for showing appropriate hints
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setShortcutKey("⌘");
    }
  }, []);

  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Daily usage counter (client-side tracking)
  const [dailyUsed, setDailyUsed] = useState(0);
  const dailyUsedRef = useRef(dailyUsed);
  useEffect(() => { dailyUsedRef.current = dailyUsed; }, [dailyUsed]);

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("snapcode-daily-usage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          setDailyUsed(parsed.count);
        } else {
          localStorage.setItem("snapcode-daily-usage", JSON.stringify({ date: today, count: 0 }));
        }
      }
    } catch {
      // Corrupted localStorage — ignore
    }
  }, []);

  // Cleanup Object URL on unmount / when imagePreview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
    setError(null);
    // Set preview from first file for loading screen
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImagePreview(url);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFiles([]);
    setImagePreview(null);
    setError(null);
  }, []);

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert all files to base64
      const images = await Promise.all(
        selectedFiles.map(async (file) => ({
          mimeType: getMimeType(file),
          data: await fileToBase64(file),
        }))
      );

      const controller = new AbortController();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, framework }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate code");
      }

      // Update daily usage counter (use ref to avoid stale closure)
      const today = new Date().toDateString();
      const newCount = dailyUsedRef.current + 1;
      setDailyUsed(newCount);
      try {
        localStorage.setItem("snapcode-daily-usage", JSON.stringify({ date: today, count: newCount }));
      } catch {
        // QuotaExceededError — ignore
      }

      const screenshotBase64 = `data:${images[0].mimeType};base64,${images[0].data}`;
      const resultId = crypto.randomUUID();
      const payload = { code: data.code, framework, screenshot: screenshotBase64 };

      let saved = false;
      try {
        localStorage.setItem(`snapcode-${resultId}`, JSON.stringify(payload));
        saved = true;
      } catch {
        // localStorage full — try without screenshot (smaller payload)
        try {
          localStorage.setItem(`snapcode-${resultId}`, JSON.stringify({ code: data.code, framework, screenshot: "" }));
          saved = true;
        } catch {
          // Still failing — clear old results and retry
          try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith("snapcode-") && key !== "snapcode-daily-usage") {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
            localStorage.setItem(`snapcode-${resultId}`, JSON.stringify({ code: data.code, framework, screenshot: "" }));
            saved = true;
          } catch {
            // Give up
          }
        }
      }

      if (saved) {
        router.push(`/result/${resultId}`);
      } else {
        setError("Could not save result. Try clearing browser data and retry.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("5 free conversions")) {
        setDailyUsed(5);
      }
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to generate
  const handleGenerateRef = useRef(handleGenerate);
  handleGenerateRef.current = handleGenerate;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && selectedFiles.length > 0 && !isProcessing) {
        handleGenerateRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedFiles.length, isProcessing]);

  return (
    <div className="min-h-screen bg-black relative scroll-smooth">
      <AnimatedBackground />

      {/* Processing overlay with smooth transition */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-black"
          >
            <LoadingSteps imagePreview={imagePreview} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-14 sm:pt-20 md:pt-24 pb-10 sm:pb-16 text-center">
        {/* Floating decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="orb-float-1 absolute top-10 left-[10%] w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#ec4899]/10 blur-[80px] sm:blur-[120px]" />
          <div className="orb-float-2 absolute top-32 right-[8%] w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-[#ec4899]/15 to-[#a855f7]/10 blur-[60px] sm:blur-[100px]" />
          <div className="orb-float-3 absolute top-48 left-[40%] w-32 h-32 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#8b5cf6]/15 to-[#f472b6]/10 blur-[70px] sm:blur-[90px]" />
        </div>

        <motion.div {...fadeInUp} transition={{ duration: 0.6 }}>
          {/* Badge with shimmer */}
          <div className="badge-shine inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 glass text-[11px] sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 max-w-[calc(100%-2rem)] sm:max-w-none">
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#ec4899]">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ec4899] animate-pulse" aria-hidden="true" />
              Free
            </span>
            <span className="w-px h-3 sm:h-4 bg-[#27272a]" />
            <span className="text-gray-400">No signup required</span>
            <span className="w-px h-3 sm:h-4 bg-[#27272a]" />
            <span className="badge-v7 flex items-center gap-1 text-[#a855f7]">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              v16
            </span>
          </div>

          {/* Heading with typewriter */}
          <h1 className="glow-text text-[1.75rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight">
            Screenshot <span className="text-[#a855f7]">→</span>{" "}
            <TypewriterWord words={ROTATING_WORDS} />
          </h1>
          <span className="sr-only">Screenshot to Code - Free AI Converter. Convert any UI screenshot to HTML, React, and Next.js code instantly.</span>

          {/* Glowing line separator */}
          <div className="line-glow max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-8" />

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-1 sm:px-0">
            Upload any UI screenshot. Get clean, responsive code in seconds.
          </p>

          {/* 3-step mini guide */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-8 sm:mb-12 text-[11px] sm:text-sm">
            <span className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold">1</span>
              Upload
            </span>
            <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold">2</span>
              Pick framework
            </span>
            <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="flex items-center gap-1 sm:gap-1.5 text-gray-400">
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold">3</span>
              Get code
            </span>
          </div>
        </motion.div>

        {/* Framework Selector */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.15 }}
          className="mb-6 sm:mb-8 px-0 sm:px-2"
        >
          <p className="text-[11px] sm:text-xs text-gray-500 mb-2 sm:mb-3 uppercase tracking-wider">Pick your code type</p>
          <FrameworkSelector selected={framework} onChange={setFramework} isPro={isPro} />
        </motion.div>

        {/* Drop Zone */}
        <motion.div {...fadeInUp} transition={{ delay: 0.25 }} className="max-w-4xl mx-auto mb-4 sm:mb-6 px-0" id="dropzone" tabIndex={-1}>
          <DropZone onFilesSelect={handleFilesSelect} selectedFiles={selectedFiles} onClear={handleClear} onToast={(msg) => setToast(msg)} />
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-4 p-3 sm:p-4 card-v7 rounded-[16px] sm:rounded-[20px] border border-red-500/20 text-red-400 text-xs sm:text-sm"
            role="alert"
            aria-live="polite"
          >
            <p>{error}</p>
          </motion.div>
        )}


        {/* Generate Button */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 sm:gap-3 px-0 sm:px-0"
          >
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing}
              className={`group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white px-6 sm:px-12 py-3.5 sm:py-4 min-h-[48px] sm:min-h-[52px] btn-v6-primary btn-text-lg pulse-glow ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              Generate Code
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              {isTouchDevice ? (
                <span>Tap to generate</span>
              ) : (
                <span>{shortcutKey} + Enter</span>
              )}
              <span className="w-px h-3 bg-[#27272a]" />
              <span className={!isPro && dailyUsed >= 10 ? "text-red-400" : ""}>{isPro ? "Unlimited" : `${dailyUsed}/10 free today`}</span>
            </span>
          </motion.div>
        )}

        {/* Feature Highlights */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.4 }}
          className="mt-10 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 max-w-3xl mx-auto"
        >
          {HIGHLIGHT_FEATURES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`card-v7 card-v7-hover rounded-[14px] sm:rounded-[20px] p-2.5 sm:p-4 text-center stagger-${i + 1}`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                <span className="text-[#a855f7]">{HIGHLIGHT_ICONS[i]}</span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">{item.title}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="section-lazy relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="badge-shine inline-flex text-xs font-medium text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded-full mb-3 sm:mb-4 border border-[#a855f7]/20 tracking-widest">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Three steps. <span className="gradient-text">That&apos;s it.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="group relative card-v7 card-v7-hover rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 md:p-8 transition-all duration-300 card-shine step-connector"
            >
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 text-2xl sm:text-4xl md:text-5xl font-bold gradient-text opacity-30 group-hover:opacity-60 transition-opacity">
                {step.step}
              </div>
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] mb-3 sm:mb-4 md:mb-5">
                  {HOW_IT_WORKS_ICONS[i]}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-1.5 md:mb-2 tracking-wide">{step.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Features Grid — Bento Layout */}
      <section id="features" className="section-lazy relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="badge-shine inline-flex text-xs font-medium text-[#ec4899] bg-[#ec4899]/10 px-3 py-1 rounded-full mb-3 sm:mb-4 border border-[#ec4899]/20 tracking-widest">
            FEATURES
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            Why <span className="gradient-text">SnapCode?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {BENTO_FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className={`group card-v7 card-v7-hover card-v7-glow rounded-[14px] sm:rounded-[20px] p-4 sm:p-5 md:p-6 transition-all duration-300 card-shine ${FEATURE_GRADIENT_CLASSES[i]} ${f.span}`}
            >
              <div className="feature-icon w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                {BENTO_ICONS[i]}
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1 md:mb-1.5 tracking-wide">{f.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-12 sm:py-16 md:py-24 text-center">
        {/* Top border line — full width purple */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
        {/* Bottom border line — full width purple */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="orb-float-2 absolute top-8 left-[5%] w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#a855f7]/15 to-transparent blur-[40px]" />
          <div className="orb-float-1 absolute bottom-8 right-[5%] w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-[#ec4899]/15 to-transparent blur-[40px]" />
          <div className="orb-float-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#8b5cf6]/10 to-transparent blur-[30px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-4 sm:mx-6 md:mx-8"
        >
          <div className="bg-[#0a0a0a] rounded-[16px] sm:rounded-[20px] p-6 sm:p-10 md:p-16 relative overflow-hidden max-w-4xl mx-auto">
            {/* Dot pattern background */}
            <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2.5 sm:mb-4">
                Ready to <span className="gradient-text">try it?</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-5 sm:mb-8 max-w-lg mx-auto px-2 sm:px-0">
                Upload a screenshot and get code. It&apos;s free, takes 5 seconds, and no signup needed.
              </p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  // Move focus to drop zone for keyboard users
                  setTimeout(() => {
                    document.getElementById("dropzone")?.focus();
                  }, 500);
                }}
                type="button"
                className="pulse-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white px-6 sm:px-10 py-3 sm:py-4 min-h-[44px] sm:min-h-[48px] btn-v6-primary btn-text-lg"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Try SnapCode Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#18181b] border border-[#27272a] text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-lg max-w-[calc(100%-2rem)] sm:max-w-none text-center" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
