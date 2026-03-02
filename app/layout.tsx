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
  title: "HotChat - Flirt. Chat. Connect.",
  description:
    "HotChat - Flirt. Chat. Connect. The ultimate chat platform to meet new people, flirt, and make real connections.",
  keywords: [
    "hot chat",
    "flirt chat",
    "chat online",
    "meet people",
    "connect",
    "dating chat",
    "hotchat",
  ],
  metadataBase: new URL("https://techtonichub.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HotChat - Flirt. Chat. Connect.",
    description: "HotChat - Flirt. Chat. Connect. The ultimate chat platform to meet new people and make real connections.",
    type: "website",
    siteName: "HotChat",
    url: "https://techtonichub.xyz",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "HotChat - Flirt. Chat. Connect.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HotChat - Flirt. Chat. Connect.",
    description: "HotChat - Flirt. Chat. Connect. The ultimate chat platform to meet new people and make real connections.",
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
        <link rel="icon" href="/logo.png" type="image/png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "HotChat - Flirt. Chat. Connect.",
              url: "https://techtonichub.xyz",
              description: "HotChat - The ultimate chat platform to meet new people, flirt, and make real connections.",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
              browserRequirements: "Requires JavaScript",
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
