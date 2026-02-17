import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SnapCode — Screenshot to Code in Seconds",
  description:
    "Drop any UI screenshot and get clean, responsive HTML/React/Vue code instantly. Powered by Gemini AI. Free, no signup required.",
  keywords: [
    "screenshot to code",
    "AI code generator",
    "UI to code",
    "HTML generator",
    "React generator",
    "Figma to code",
    "screenshot to HTML",
  ],
  metadataBase: new URL("https://snapcode.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SnapCode — Screenshot to Code in Seconds",
    description: "Drop any UI screenshot and get production-ready code instantly.",
    type: "website",
    siteName: "SnapCode",
    url: "https://snapcode.dev",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SnapCode - Screenshot to Code",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnapCode — Screenshot to Code in Seconds",
    description: "Drop any UI screenshot and get production-ready code instantly.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: Only for className="dark" — prevents flash of unstyled content
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "SnapCode",
              url: "https://snapcode.dev",
              description: "Upload any UI screenshot and get clean, responsive code instantly.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-black text-white`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#a855f7] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
          Skip to main content
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main-content" className="pt-14 sm:pt-16">{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
