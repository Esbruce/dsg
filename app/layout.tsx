import type { Metadata } from "next";
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
  description: "AI-powered medical notes summarization tool for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
  keywords: ["discharge summary", "medical notes", "healthcare", "AI", "medical documentation", "patient care", "healthcare professionals"],
  authors: [{ name: "Discharge Summary Generator" }],
  creator: "Discharge Summary Generator",
  publisher: "Discharge Summary Generator",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dischargesummarygenerator.website",
    siteName: "Discharge Summary Generator",
    title: "Discharge Summary Generator - AI-Powered Medical Notes Summarization",
    description: "AI-powered medical notes summarization tool for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
    images: [
      {
        url: "/dsg_brand.jpg",
        width: 1200,
        height: 630,
        alt: "Discharge Summary Generator - AI-Powered Medical Documentation Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discharge Summary Generator - AI-Powered Medical Notes Summarization",
    description: "AI-powered medical notes summarization tool for healthcare professionals. Convert patient notes into comprehensive discharge summaries and care plans instantly.",
    images: ["/dsg_brand.jpg"],
    creator: "@dischargesummarygen",
  },
  verification: {
    google: "your-google-verification-code", // Replace with your actual Google verification code
  },
  alternates: {
    canonical: "https://dischargesummarygenerator.website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
