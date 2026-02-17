"use client";

import { useEffect, useState, useRef, useCallback, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Send,
  Loader2,
  Eye,
  Code,
  Sparkles,
  RotateCcw,
  PanelRightClose,
  PanelRightOpen,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Palette,
  Layers,
} from "lucide-react";
import dynamic from "next/dynamic";
import ResponsivePreview from "@/components/ResponsivePreview";
import ShareCard from "@/components/ShareCard";
import ExportDropdown from "@/components/ExportDropdown";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[580px] bg-[#18181b] rounded-lg animate-pulse" />
  ),
});

interface ResultData {
  code: string;
  framework: string;
  screenshot: string;
}

function isResultData(data: unknown): data is ResultData {
  return (
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof (data as ResultData).code === "string" &&
    "framework" in data &&
    typeof (data as ResultData).framework === "string"
  );
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const isPro = session?.user?.plan === "pro" || session?.user?.plan === "team";
  const [data, setData] = useState<ResultData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [framework, setFramework] = useState("html-tailwind");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [codeView, setCodeView] = useState<"full" | "html" | "css">("full");
  const [codePanelWidth, setCodePanelWidth] = useState(50); // percentage (30-50)
  const [codePanelVisible, setCodePanelVisible] = useState(true);
  const [editSectionOpen, setEditSectionOpen] = useState(true);
  const [editCount, setEditCount] = useState(0);
  const EDIT_LIMIT = isPro ? Infinity : 3;
  const [isResizing, setIsResizing] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const startResizeTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const startX = e.touches[0].clientX;
    const startWidth = codePanelWidth;

    const onTouchMove = (ev: TouchEvent) => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const delta = ((ev.touches[0].clientX - startX) / containerWidth) * 100;
      // Moving right = code panel shrinks, moving left = code panel grows
      setCodePanelWidth(Math.min(50, Math.max(30, startWidth - delta)));
    };

    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }, [codePanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const codeWidth = ((rect.width - offsetX) / rect.width) * 100;
      setCodePanelWidth(Math.min(50, Math.max(30, codeWidth)));
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsResizing(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`snapcode-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!isResultData(parsed)) {
          setLoaded(true);
          return;
        }
        const resultData = parsed;
        setData(resultData);
        setCode(resultData.code);
        setOriginalCode(resultData.code);
        setFramework(resultData.framework);
      }
    } catch {
      // Corrupted localStorage data — ignore
    }
    setLoaded(true);
  }, [id]);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);
  const pauseToast = () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  const resumeToast = () => { toastTimerRef.current = setTimeout(() => setToast(null), 2000); };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Split code into HTML-only (no classes/styles) and CSS-only
  const { htmlOnly, cssOnly } = useMemo(() => {
    // HTML = strip class="..." and style="..." attributes → bare structure
    const html = code
      .replace(/\s+class="[^"]*"/gi, "")
      .replace(/\s+style="[^"]*"/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // CSS = extract <style> contents + all Tailwind classes
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styles: string[] = [];
    let m;
    while ((m = styleRegex.exec(code)) !== null) {
      styles.push(m[1].trim());
    }

    // Extract all class="" values
    const classRegex = /class="([^"]*)"/gi;
    const allClasses = new Set<string>();
    let cm;
    while ((cm = classRegex.exec(code)) !== null) {
      cm[1].split(/\s+/).filter(Boolean).forEach((c) => allClasses.add(c));
    }

    // Extract inline style="" values
    const inlineRegex = /style="([^"]*)"/gi;
    const inlineStyles: string[] = [];
    let im;
    while ((im = inlineRegex.exec(code)) !== null) {
      if (im[1].trim()) inlineStyles.push(im[1].trim());
    }

    // Build CSS output
    const parts: string[] = [];
    if (styles.length > 0) {
      parts.push("/* ── Custom CSS ── */\n\n" + styles.join("\n\n"));
    }
    if (allClasses.size > 0) {
      const sorted = [...allClasses].sort();
      parts.push("/* ── Tailwind Classes Used ── */\n\n" + sorted.map((c) => "." + c).join("\n"));
    }
    if (inlineStyles.length > 0) {
      parts.push("/* ── Inline Styles ── */\n\n" + inlineStyles.map((s, i) => `/* Element ${i + 1} */\n${s}`).join("\n\n"));
    }

    return { htmlOnly: html, cssOnly: parts.join("\n\n") || "/* No CSS found */" };
  }, [code]);

  const displayCode = codeView === "html" ? htmlOnly : codeView === "css" ? cssOnly : code;

  const handleEdit = async (prompt?: string) => {
    const instruction = prompt || editPrompt.trim();
    if (!instruction || isEditing) return;

    if (!isPro && editCount >= EDIT_LIMIT) {
      showToast("You've used all 3 free edits for this conversion. Upgrade to Pro!", "error");
      return;
    }

    setIsEditing(true);
    setEditHistory((prev) => [...prev.slice(-49), code]);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, instruction, framework, resultId: id }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || "Edit failed", "error");
        return;
      }
      const result = await res.json();
      if (result.success) {
        setCode(result.code);
        setEditPrompt("");
        setEditCount((c) => c + 1);
        showToast(isPro ? "Code updated!" : `Code updated! (${editCount + 1}/${EDIT_LIMIT} edits used)`);
      } else {
        showToast("Edit failed. Try again.", "error");
      }
    } catch {
      showToast("Edit failed. Try again.", "error");
    } finally {
      setIsEditing(false);
    }
  };

  const handleUndo = () => {
    if (editHistory.length > 0) {
      const prev = editHistory[editHistory.length - 1];
      setEditHistory((h) => h.slice(0, -1));
      setCode(prev);
      showToast("Undo successful");
    }
  };

  const handleReset = () => {
    setCode(originalCode);
    setEditHistory([]);
    showToast("Code reset to original");
  };

  // Keyboard shortcuts (use refs to avoid stale closures)
  const codeRef = useRef(code);
  codeRef.current = code;
  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        // Only intercept if not in an input or editor
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.closest(".monaco-editor")) return;
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(codeRef.current);
          showToast("Copied!", "success");
        } catch {
          showToast("Failed to copy", "error");
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        // Don't intercept if user is in the code editor
        const active = document.activeElement;
        if (active?.closest(".monaco-editor")) return;
        if (editHistory.length > 0) {
          e.preventDefault();
          handleUndoRef.current();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editHistory.length, showToast]);

  // ── Loading skeleton ──
  if (!loaded) {
    return (
      <div className="min-h-screen bg-black px-2 sm:px-3 md:px-4 py-3 sm:py-4">
        <div className="max-w-[1800px] mx-auto">
          {/* Toolbar skeleton */}
          <div className="h-11 sm:h-12 bg-[#18181b] rounded-lg sm:rounded-xl mb-3 sm:mb-4 animate-pulse" />
          {/* Content skeleton */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 h-[250px] sm:h-[350px] md:h-[400px] lg:h-[500px] bg-[#18181b] rounded-xl sm:rounded-2xl animate-pulse" />
            <div className="hidden lg:block w-[30%] h-[500px] bg-[#18181b] rounded-2xl animate-pulse" />
          </div>
          {/* Edit section skeleton */}
          <div className="mt-3 sm:mt-4 max-w-5xl mx-auto">
            <div className="h-10 bg-[#18181b] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── Empty State ──
  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-3 sm:px-4 pb-[env(safe-area-inset-bottom)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-[#a855f7]/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-[#ec4899]/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center card-v7 rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 md:p-12 max-w-[calc(100vw-1.5rem)] sm:max-w-md w-full relative"
        >
          <div className="relative inline-flex mb-4 sm:mb-5">
            <div className="absolute inset-0 bg-[#a855f7]/10 rounded-2xl blur-xl" />
            <Code className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-600 mx-auto" />
          </div>
          <p className="text-[13px] sm:text-sm md:text-base text-gray-400 mb-5 sm:mb-6">No result found. Generate code first.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 min-h-[48px] bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white btn-v6-primary btn-text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-[env(safe-area-inset-bottom)]">
      <h1 className="sr-only">Code Editor - SnapCode</h1>
      {/* ── Resize overlay ── */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
      {/* ── Toast (enhanced with gradient left border & smoother animations) ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
            onMouseEnter={pauseToast}
            onMouseLeave={resumeToast}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-[100] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 toast-v7 max-w-full sm:max-w-sm overflow-hidden cursor-default"
          >
            {/* Gradient left accent */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
                toast.type === "success"
                  ? "bg-gradient-to-b from-[#a855f7] to-[#ec4899]"
                  : "bg-gradient-to-b from-red-500 to-red-400"
              }`}
            />
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-[#ec4899] shrink-0" />
            ) : (
              <span className="inline-flex items-center justify-center w-4 h-4 text-red-400 shrink-0 text-xs font-bold">!</span>
            )}
            <span className="text-xs sm:text-sm text-white truncate">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Top Toolbar (enhanced with gradient hovers & bottom gradient line) ── */}
      <div className="sticky top-14 sm:top-16 z-40 toolbar-v7 relative">
        <div className="max-w-[1800px] mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-2.5">
          {/* Row 1: Actions */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto scrollbar-hide min-w-0">
              <button
                onClick={() => router.push("/")}
                aria-label="New conversion"
                className="flex items-center gap-1 sm:gap-1.5 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] px-2 sm:px-3 md:px-3.5 py-2 shrink-0 btn-v6-ghost btn-text-sm"
                title="New"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>

              <div className="h-5 w-px bg-[#27272a] shrink-0 hidden sm:block" />

              <button
                onClick={handleReset}
                aria-label="Reset to original code"
                className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-white min-w-[44px] min-h-[44px] px-2 sm:px-2.5 py-1.5 shrink-0 justify-center btn-v6-ghost btn-text-sm"
                title="Reset to original"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset</span>
              </button>

              {editHistory.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="text-[#a855f7] hover:text-[#c084fc] min-w-[44px] min-h-[44px] px-2 sm:px-2.5 py-1.5 shrink-0 flex items-center justify-center btn-v6-ghost btn-text-sm hover:bg-[#a855f7]/10"
                  aria-label="Undo last edit"
                  title="Undo last edit"
                >
                  <span className="hidden sm:inline">Undo</span>
                  <RotateCcw className="w-3.5 h-3.5 sm:hidden" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <ExportDropdown code={code} framework={framework} id={id} onToast={showToast} />
              <ShareCard />
              <button
                onClick={() => setCodePanelVisible((v) => !v)}
                className="hidden lg:flex items-center gap-1.5 min-h-[44px] px-2.5 py-1.5 text-gray-400 bg-transparent shrink-0 justify-center rounded-lg text-xs btn-v6-ghost"
                aria-label={codePanelVisible ? "Hide code panel" : "Show code panel"}
                title={codePanelVisible ? "Hide code" : "Show code"}
              >
                {codePanelVisible ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                <span>Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Thin gradient line at bottom of toolbar (matching navbar) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a855f7]/40 to-transparent" />
      </div>

      {/* ── Loading overlay (enhanced with mesh gradient & glow trail spinner) ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 sm:px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mesh-gradient card-v7 card-v7-elevated rounded-[16px] sm:rounded-[20px] p-5 sm:p-8 flex flex-col items-center gap-3 sm:gap-4 max-w-[280px] sm:max-w-xs w-full shadow-[0_0_60px_-15px_rgba(168,85,247,0.2)]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#a855f7]/20 rounded-full blur-xl" />
                <Loader2 className="relative w-6 h-6 sm:w-8 sm:h-8 text-[#a855f7] animate-spin-glow" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 text-center">AI is updating your code...</p>
              <div className="w-32 h-1 rounded-full bg-[#18181b] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="max-w-[1800px] mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
        {/* ── Mobile / Tablet Tabs (enhanced with gradient underline) ── */}
        <div
          role="tablist"
          className="flex lg:hidden mb-3 sm:mb-4 gap-1.5 sm:gap-2 rounded-[20px]"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              setActiveTab(activeTab === "preview" ? "code" : "preview");
            }
          }}
        >
          <button
            role="tab"
            id="tab-preview"
            aria-selected={activeTab === "preview"}
            aria-controls="panel-preview"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 sm:py-3.5 min-h-[48px] text-[13px] sm:text-sm relative overflow-hidden btn-v6-tab ${
              activeTab === "preview"
                ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20"
                : "bg-[#18181b] text-gray-500 hover:text-gray-400 hover:bg-[#1c1c1f]"
            }`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            Preview
            {activeTab === "preview" && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
          <button
            role="tab"
            id="tab-code"
            aria-selected={activeTab === "code"}
            aria-controls="panel-code"
            onClick={() => setActiveTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 sm:py-3.5 min-h-[48px] text-[13px] sm:text-sm relative overflow-hidden btn-v6-tab ${
              activeTab === "code"
                ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20"
                : "bg-[#18181b] text-gray-500 hover:text-gray-400 hover:bg-[#1c1c1f]"
            }`}
          >
            <Code className="w-4 h-4 sm:w-5 sm:h-5" />
            Code
            {activeTab === "code" && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* ── Desktop: Side by Side with resizable divider ── */}
        <div
          ref={containerRef}
          className="hidden lg:flex gap-0"
          style={{ height: "clamp(400px, calc(100vh - 180px), calc(100vh - 120px))" }}
        >
          {/* Preview Panel */}
          <div
            className="panel-v7 panel-glow h-full overflow-hidden transition-[width] duration-300"
            style={{ width: codePanelVisible ? `${100 - codePanelWidth}%` : "100%" }}
          >
            <ResponsivePreview code={code} framework={framework} />
          </div>

          {codePanelVisible && (
            <>
              {/* Resize Handle */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize panels"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setCodePanelWidth(prev => Math.min(50, prev + 2));
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setCodePanelWidth(prev => Math.max(30, prev - 2));
                  }
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={startResizeTouch}
                className="relative w-3 flex-shrink-0 cursor-col-resize group z-10 flex items-center justify-center select-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:outline-none"
                title="Drag to resize"
              >
                <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#27272a] group-hover:bg-[#a855f7]/60 transition-colors duration-150" />
                <div className="relative flex flex-col gap-1.5 items-center">
                  <div className="w-1 h-1 rounded-full bg-[#3f3f46] group-hover:bg-[#a855f7] transition-colors" />
                  <div className="w-1 h-1 rounded-full bg-[#3f3f46] group-hover:bg-[#a855f7] transition-colors" />
                  <div className="w-1 h-1 rounded-full bg-[#3f3f46] group-hover:bg-[#a855f7] transition-colors" />
                  <div className="w-1 h-1 rounded-full bg-[#3f3f46] group-hover:bg-[#a855f7] transition-colors" />
                  <div className="w-1 h-1 rounded-full bg-[#3f3f46] group-hover:bg-[#a855f7] transition-colors" />
                </div>
              </div>

              {/* Code Panel */}
              <div
                className="panel-v7 panel-glow h-full overflow-hidden transition-[width] duration-300 flex flex-col"
                style={{ width: `${codePanelWidth}%` }}
              >
                {/* Code view tabs */}
                <div className="flex items-center gap-0.5 lg:gap-1 px-1.5 lg:px-2 pt-1.5 lg:pt-2 pb-1 border-b border-[#27272a] shrink-0">
                  {([
                    { key: "full", label: "Full", icon: <Layers className="w-3 h-3" /> },
                    { key: "html", label: "HTML", icon: <FileCode2 className="w-3 h-3" /> },
                    { key: "css", label: "CSS", icon: <Palette className="w-3 h-3" /> },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCodeView(tab.key)}
                      className={`flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-1.5 min-h-[36px] rounded-md text-[11px] lg:text-xs font-medium transition-colors ${
                        codeView === tab.key
                          ? "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/25"
                          : "text-gray-500 hover:text-gray-300 hover:bg-[#18181b]"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor
                    key={codeView}
                    code={displayCode}
                    onChange={codeView === "full" ? setCode : undefined}
                    language={codeView === "css" ? "css" : "html"}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Mobile / Tablet: Tab Content (enhanced with panel glow on active) ── */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "preview" ? (
              <motion.div
                key="preview"
                role="tabpanel"
                id="panel-preview"
                aria-labelledby="tab-preview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="panel-v7 panel-glow w-full h-[55vh] min-h-[300px] sm:h-[60vh] sm:min-h-[400px] md:h-[65vh]"
              >
                <ResponsivePreview code={code} framework={framework} />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                role="tabpanel"
                id="panel-code"
                aria-labelledby="tab-code"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="panel-v7 panel-glow h-[50vh] min-h-[300px] sm:min-h-[350px] md:h-[500px] w-full flex flex-col"
              >
                {/* Code view tabs (mobile) */}
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 pt-1.5 sm:pt-2 pb-1 border-b border-[#27272a] shrink-0">
                  {([
                    { key: "full", label: "Full", icon: <Layers className="w-3 h-3" /> },
                    { key: "html", label: "HTML", icon: <FileCode2 className="w-3 h-3" /> },
                    { key: "css", label: "CSS", icon: <Palette className="w-3 h-3" /> },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setCodeView(tab.key)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 sm:py-1.5 min-h-[44px] rounded-md text-[11px] sm:text-xs font-medium transition-colors ${
                        codeView === tab.key
                          ? "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/25"
                          : "text-gray-500 hover:text-gray-300 hover:bg-[#18181b]"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor
                    key={codeView}
                    code={displayCode}
                    onChange={codeView === "full" ? setCode : undefined}
                    language={codeView === "css" ? "css" : "html"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── AI Edit Section ── */}
        <div id="ai-edit" className="mt-2 sm:mt-3 md:mt-4 max-w-5xl mx-auto px-0.5 sm:px-0">
          {/* Toggle header */}
          <button
            onClick={() => setEditSectionOpen((v) => !v)}
            aria-expanded={editSectionOpen}
            className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 px-1 min-h-[44px] text-gray-500"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="text-xs font-medium">Edit with AI</span>
            {!isPro && (
              <span className={`text-[10px] px-1.5 py-px rounded-full ${editCount >= EDIT_LIMIT ? "bg-red-500/15 text-red-400" : "bg-[#27272a] text-gray-500"}`}>
                {editCount}/{EDIT_LIMIT}
              </span>
            )}
            {isPro && (
              <span className="text-[10px] px-1.5 py-px rounded-full bg-[#a855f7]/15 text-[#a855f7]">
                Unlimited
              </span>
            )}
            {editSectionOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {editSectionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {editCount >= EDIT_LIMIT ? (
                  <div className="flex flex-col items-center gap-2 py-4 px-3 bg-[#0a0a0a] border border-[#27272a] rounded-lg sm:rounded-xl">
                    <p className="text-xs text-gray-500 text-center">You&apos;ve used all {EDIT_LIMIT} free edits for this conversion.</p>
                    <a href="/pricing" className="text-xs text-[#a855f7] hover:text-[#c084fc] font-medium">Upgrade to Pro for unlimited edits →</a>
                  </div>
                ) : (
                  <div className="flex items-center bg-[#0a0a0a] border border-[#27272a] rounded-lg sm:rounded-xl focus-within:border-[#444] transition-colors duration-200 px-1 outline-none ring-0">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                      placeholder="e.g. 'make button bigger'"
                      aria-label="Describe code changes"
                      autoComplete="off"
                      className="flex-1 min-w-0 bg-transparent px-2 sm:px-3 py-3 text-[13px] sm:text-sm text-white placeholder-gray-600 focus:outline-none"
                    />
                    <button
                      onClick={() => handleEdit()}
                      disabled={isEditing || !editPrompt.trim()}
                      className={`flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-lg shrink-0 transition-all duration-200 ${
                        editPrompt.trim() && !isEditing
                          ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-lg shadow-[#a855f7]/20 hover:shadow-[#a855f7]/40 hover:scale-105"
                          : "bg-[#18181b] text-gray-600 cursor-not-allowed"
                      }`}
                      aria-label="Send edit"
                    >
                      {isEditing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
