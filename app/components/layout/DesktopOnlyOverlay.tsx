"use client";
import React from "react";

export default function DesktopOnlyOverlay() {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      if (currentUrl) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="desktop-only-overlay">
      <div className="max-w-xl w-full px-6 mx-auto">
        {/* Logo/Brand */}

        {/* Desktop requirement */}
        <div className="bg-[var(--color-bg-2)] border border-[var(--color-neutral-200)] rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-[var(--color-primary)] mb-2 uppercase tracking-wide">
            Notice
          </h3>
          <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed">
            We apologise. For usability and readability, DSG is currently designed for use only on devices with larger screens. Please try on a computer or tablet.
          </p>
        </div>

        {/* About the product */}
        <div className="rounded-xl border border-[var(--color-neutral-200)] p-5 mb-6">
          <h3 className="text-sm font-medium text-[var(--color-neutral-900)] mb-3 tracking-tight">
            What you can expect when using DSG
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 mt-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span>Structured summaries and plans created with AI, that are clear, consistent, and easy to export.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 mt-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span> A design that focuses on speed for the user whilst maintaining accuracy.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 mt-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span>Your data staying private and secure as per our privacy policy.</span>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-[var(--color-bg-2)] border border-[var(--color-neutral-200)] rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-[var(--color-primary)] mb-4 uppercase tracking-wide">
            System Requirements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span>Minimum 1080px screen width</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span>Chrome, Firefox, or Safari browser</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-neutral-700)]">
              <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full flex-shrink-0"></div>
              <span>Stable internet connection</span>
            </div>
          </div>
        </div>

        {/* Continue on desktop actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[var(--color-neutral-900)] mb-3 tracking-tight">
            Continue on your computer
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--color-neutral-300)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-neutral-900)] hover:bg-[var(--color-bg-2)] transition-colors"
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent("Open DSG on my computer")}&body=${encodeURIComponent("Please open this link on your computer: " + currentUrl)}`}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Email me this link
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="text-xs text-[var(--color-neutral-500)]">
          Need assistance?{" "}
          <a 
            href="mailto:revivewebsites@outlook.com" 
            className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors duration-200 underline underline-offset-2"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
} 