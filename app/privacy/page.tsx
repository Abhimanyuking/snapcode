import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — SnapCode",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SnapCode
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-400">
          <p><strong className="text-white">Last updated:</strong> February 2026</p>

          <h2 className="text-xl font-semibold text-white mt-8">What We Collect</h2>
          <p>
            <strong className="text-gray-300">Almost nothing.</strong> SnapCode is designed to be
            privacy-friendly. Here&apos;s exactly what happens:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-gray-300">Screenshots</strong> — Sent directly to Google Gemini AI
              for processing. We do not store, save, or log your images on our servers.
            </li>
            <li>
              <strong className="text-gray-300">Generated code</strong> — Stored only in your browser&apos;s
              local storage. We never see or store your generated code.
            </li>
            <li>
              <strong className="text-gray-300">IP address</strong> — Used temporarily for rate limiting
              (10 requests/minute, 5 generations/day). Not logged permanently.
            </li>
            <li>
              <strong className="text-gray-300">Analytics</strong> — We use Vercel Analytics to track
              page views and basic usage. This data is anonymous and does not include personal information.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">What We Don&apos;t Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>No account or login required</li>
            <li>No email addresses (unless you contact us)</li>
            <li>No cookies (except essential ones)</li>
            <li>No tracking pixels or third-party trackers</li>
            <li>No selling data to anyone</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-gray-300">Google Gemini AI</strong> — Processes your screenshots.
              Subject to <a href="https://ai.google.dev/terms" className="text-[#a855f7] hover:underline" target="_blank" rel="noopener noreferrer">Google&apos;s AI Terms</a>.
            </li>
            <li>
              <strong className="text-gray-300">Vercel</strong> — Hosts the website and provides analytics.
              Subject to <a href="https://vercel.com/legal/privacy-policy" className="text-[#a855f7] hover:underline" target="_blank" rel="noopener noreferrer">Vercel&apos;s Privacy Policy</a>.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Your Rights</h2>
          <p>
            Since we don&apos;t collect personal data, there&apos;s nothing to delete. If you
            want to clear your locally stored results, clear your browser&apos;s local storage.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Changes</h2>
          <p>
            We may update this policy. If we do, we&apos;ll update the date at the top.
          </p>

          <p className="text-gray-600 mt-12">
            Questions? Contact us at hello@snapcode.dev
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
