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
  title: "Screenshot to Code — Free AI Tool | SnapCode",
  description:
    "Convert any screenshot to clean HTML, React & Next.js code instantly. Free screenshot to code converter powered by AI. No signup required. Upload a UI screenshot and get responsive, production-ready code in seconds.",
  keywords: [
    "screenshot to code",
    "screenshot to code AI",
    "screenshot to code free",
    "screenshot to HTML",
    "screenshot to React",
    "UI to code",
    "image to code",
    "design to code",
    "AI code generator",
    "screenshot to code online",
    "convert screenshot to code",
    "screenshot to code converter",
    "Figma to code",
    "UI screenshot to code",
  ],
  metadataBase: new URL("https://techtonichub.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Screenshot to Code — Free AI Tool | SnapCode",
    description: "Upload any UI screenshot and get clean, responsive HTML/React/Next.js code instantly. Free, no signup required.",
    type: "website",
    siteName: "SnapCode",
    url: "https://techtonichub.xyz",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Screenshot to Code - Free AI Converter | SnapCode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Screenshot to Code — Free AI Tool | SnapCode",
    description: "Upload any UI screenshot and get clean, responsive code instantly. Free, no signup required.",
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
              name: "SnapCode - Screenshot to Code",
              alternateName: "Screenshot to Code Converter",
              url: "https://techtonichub.xyz",
              description: "Free AI tool to convert any screenshot to clean, responsive HTML, React & Next.js code instantly. Upload a UI screenshot and get production-ready code in seconds.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
              },
              featureList: "Screenshot to Code, UI to HTML, Screenshot to React, Screenshot to Next.js, AI Code Generator, Image to Code Converter",
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
