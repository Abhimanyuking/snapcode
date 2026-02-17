"use client";

import { useState, useEffect } from "react";
import { Check, Link, Twitter } from "lucide-react";

export default function ShareCard() {
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState("https://snapcode.dev");

  useEffect(() => {
    setSiteUrl(window.location.origin);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      "Just converted a screenshot to code in seconds using SnapCode! Try it free:"
    );
    const url = encodeURIComponent(siteUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };


  return (
    <div className="flex flex-row items-center gap-1 sm:gap-2">
      <button
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy share link"}
        className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[44px] min-h-[44px] bg-[#18181b] hover:bg-[#27272a] text-gray-300 btn-v6-secondary btn-text-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-[#ec4899] shrink-0" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Link className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>
      <button
        onClick={handleTwitterShare}
        aria-label="Share on Twitter"
        className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 min-w-[44px] min-h-[44px] bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] btn-v6-secondary btn-text-sm"
      >
        <Twitter className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline">Tweet</span>
      </button>
    </div>
  );
}
