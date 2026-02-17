"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, X, Clipboard, Check } from "lucide-react";
import NextImage from "next/image";

const MAX_FILES = 5;

interface DropZoneProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onClear: () => void;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function DropZone({ onFilesSelect, selectedFiles, onClear, onToast }: DropZoneProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef<string[]>([]);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => { previewsRef.current = previews; }, [previews]);
  useEffect(() => {
    return () => { previewsRef.current.forEach((p) => URL.revokeObjectURL(p)); };
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const combined = [...selectedFiles, ...newFiles].slice(0, MAX_FILES);
      onFilesSelect(combined);

      setPreviews((prev) => {
        const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
        return [...prev, ...newPreviews].slice(0, MAX_FILES);
      });

      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        onToast?.(`Max ${MAX_FILES} screenshots allowed`, "error");
      }
    },
    [selectedFiles, onFilesSelect, onToast]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const rejection = rejections[0];
      if (!rejection) return;
      const error = rejection.errors[0];
      if (error?.code === "file-too-large") {
        onToast?.("File too large — max 10MB allowed", "error");
      } else if (error?.code === "file-invalid-type") {
        onToast?.("Only PNG, JPG, and WEBP images are allowed", "error");
      } else if (error?.code === "too-many-files") {
        onToast?.(`Max ${MAX_FILES} screenshots at a time`, "error");
      } else {
        onToast?.("Could not upload this file. Try a PNG or JPG.", "error");
      }
    },
    [onToast]
  );

  // Clipboard paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) addFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: MAX_FILES,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
    if (newFiles.length === 0) {
      onClear();
    } else {
      onFilesSelect(newFiles);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    onClear();
  };

  const hasFiles = selectedFiles.length > 0 && previews.length > 0;

  return (
    <div
      {...getRootProps()}
      className={`relative w-full min-h-[220px] min-[390px]:min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[380px] rounded-[16px] sm:rounded-[20px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${
        isDragActive
          ? "animate-pulse-border border-2 border-[#a855f7] scale-[1.01]"
          : hasFiles
          ? "border-0"
          : "border-2 border-dashed border-[#a855f7]/30 hover:border-[#a855f7]/60"
      }`}
    >
      {/* Background effects */}
      {isDragActive ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 mesh-gradient-drag"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#000000]" />
      )}

      {hasFiles && (
        <div className="absolute inset-0 rounded-2xl animate-rainbow-glow" />
      )}

      {!hasFiles && <div className="absolute inset-0 shimmer" />}

      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {hasFiles ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full h-full min-h-[220px] min-[390px]:min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-[380px] flex flex-col items-center justify-center p-3 min-[390px]:p-4 sm:p-6 z-10"
          >
            <button
              onClick={handleClearAll}
              aria-label="Remove all screenshots"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center justify-center min-w-[44px] min-h-[44px] bg-black/60 hover:bg-red-500/80 text-gray-400 hover:text-white rounded-full backdrop-blur-sm border border-white/10 hover:border-red-500/50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thumbnails grid */}
            <div className="flex items-center justify-center gap-2 min-[390px]:gap-3 sm:gap-4 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/20 rounded-xl blur-md" />
                  <NextImage
                    src={p}
                    alt={`Screenshot ${i + 1}`}
                    width={150}
                    height={100}
                    className="relative max-h-[90px] min-[390px]:max-h-[100px] sm:max-h-[140px] md:max-h-[160px] w-auto rounded-lg sm:rounded-xl object-contain shadow-lg"
                  />
                  <button
                    onClick={(e) => removeFile(i, e)}
                    className="absolute -top-2 -right-2 min-w-[28px] min-h-[28px] sm:min-w-[24px] sm:min-h-[24px] w-7 h-7 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                    aria-label={`Remove screenshot ${i + 1}`}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
              ))}

              {/* Add more button */}
              {selectedFiles.length < MAX_FILES && (
                <div className="w-[80px] h-[80px] min-[390px]:w-[90px] min-[390px]:h-[90px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded-lg sm:rounded-xl border-2 border-dashed border-[#a855f7]/30 flex flex-col items-center justify-center text-gray-500 hover:text-[#a855f7] hover:border-[#a855f7]/60 active:bg-[#a855f7]/5 transition-colors touch-manipulation">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
                  <span className="text-[9px] sm:text-[10px]">Add more</span>
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[11px] min-[390px]:text-xs sm:text-sm text-emerald-400 bg-emerald-500/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-500/20 badge-v7">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {selectedFiles.length} screenshot{selectedFiles.length > 1 ? "s" : ""} ready — hit Generate!
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-3 min-[390px]:gap-4 sm:gap-5 p-4 min-[390px]:p-5 sm:p-8"
          >
            {isDragActive ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-14 h-14 min-[390px]:w-16 min-[390px]:h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#a855f7]/20 flex items-center justify-center"
                >
                  <Upload className="w-7 h-7 min-[390px]:w-8 min-[390px]:h-8 sm:w-10 sm:h-10 text-[#a855f7]" />
                </motion.div>
                <p className="text-base min-[390px]:text-lg sm:text-xl font-semibold text-[#a855f7] tracking-wide">Drop it here!</p>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-[#a855f7]/10 rounded-2xl blur-xl" />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="relative w-14 h-14 min-[390px]:w-16 min-[390px]:h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#18181b] to-[#0a0a0a] border border-[#27272a] flex items-center justify-center"
                  >
                    <Image className="w-6 h-6 min-[390px]:w-7 min-[390px]:h-7 sm:w-9 sm:h-9 text-gray-500" />
                  </motion.div>
                </div>
                <div className="text-center px-1">
                  <p className="text-base min-[390px]:text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-1.5 tracking-wide leading-snug">
                    Drop screenshots of any website or app
                  </p>
                  <p className="text-[11px] min-[390px]:text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    PNG, JPG or WEBP &middot; Max 10MB each &middot; Up to {MAX_FILES} at once
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 justify-center text-[11px] sm:text-xs text-gray-500 flex-wrap">
                    <span className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-[#18181b]/50 border border-[#27272a]/50 btn-text-sm">
                      <Clipboard className="w-3 h-3" />
                      or press {isMac ? "\u2318V" : "Ctrl+V"} to paste from clipboard
                    </span>
                    <span className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-full bg-[#18181b]/50 border border-[#27272a]/50 btn-text-sm min-h-[44px] touch-manipulation">
                      <Upload className="w-3 h-3" />
                      Tap to upload
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-[#18181b]/50 border border-[#27272a]/50 btn-text-sm">
                      <Upload className="w-3 h-3" />
                      Click or drag
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
