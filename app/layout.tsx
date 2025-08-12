import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discharge Summary Generator",
  description: "AI-powered discharge summary generator for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
  keywords: ["discharge summary", "medical notes", "healthcare", "AI", "medical documentation", "patient care", "healthcare professionals"],
  authors: [{ name: "Discharge Summary Generator" }],
  creator: "Discharge Summary Generator",
  publisher: "Discharge Summary Generator",
  applicationName: "Discharge Summary Generator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    other: [
      { rel: "mask-icon", url: "/dsg_brand_bw.svg", color: "#01a5a5" },
    ],
  },
  manifest: "/site.webmanifest?v=3",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dischargesummarygenerator.website",
    siteName: "Discharge Summary Generator",
    title: "Discharge Summary Generator - AI-Powered Medical Notes Summarization",
    description: "AI-powered discharge summary generator for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "AI-Powered Discharge Summary Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discharge Summary Generator",
    description: "AI-powered discharge summary generator for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "AI-Powered Discharge Summary Generator",
      },
    ],
    creator: "@dischargesummarygen",
  },
  other: {
    "msapplication-TileColor": "#01a5a5",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://dischargesummarygenerator.website",
  },
};

export const viewport: Viewport = {
  themeColor: "#01a5a5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
