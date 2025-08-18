import React from "react";

export default function DesktopOnlyOverlay() {
  return (
    <div className="desktop-only-overlay">
      <div className="max-w-lg px-6">
        {/* Logo/Brand */}
        <div className="mb-2">
          <h2 className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-widest mb-2">
            DSG
          </h2>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-900)] tracking-tight">
            Discharge Summary Generator
          </h1>
        </div>

        {/* Title */}
        {/* <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)] mb-4 tracking-tight">
          Desktop Experience Required
        </h2> */}

        {/* Description */}
        <p className="text-base text-[var(--color-neutral-600)] mb-8 leading-relaxed max-w-md mx-auto">
          Sorry please use a device with a larger screen. 
          
        </p>

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