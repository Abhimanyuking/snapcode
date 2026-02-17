import { Code2 } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 py-5 min-[390px]:py-6 sm:py-8 md:py-10 pb-[calc(1.25rem+env(safe-area-inset-bottom))] min-[390px]:pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-8 md:pb-10">
      <div className="footer-glow-line mb-4 min-[390px]:mb-5 sm:mb-6 md:mb-8" />
      <div className="max-w-6xl mx-auto px-3 min-[390px]:px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 min-[390px]:gap-4 sm:gap-5 md:gap-6 text-[11px] min-[390px]:text-xs sm:text-sm text-gray-500 text-center">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a855f7]" />
          <span>SnapCode v15</span>
        </div>
        <p>Made with ❤️ &middot; Free &amp; Open Source</p>
        <div className="flex items-center gap-1 min-[390px]:gap-2 sm:gap-3 text-[11px] min-[390px]:text-xs text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center px-1.5 sm:px-0">Terms</Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center px-1.5 sm:px-0">Privacy</Link>
          <span>&middot;</span>
          <Link href="/pricing" className="hover:text-white transition-colors min-h-[44px] sm:min-h-0 flex items-center px-1.5 sm:px-0">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
