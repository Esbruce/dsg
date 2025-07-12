import React from "react";

export default function DesktopOnlyOverlay() {
  return (
    <div className="desktop-only-overlay">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--color-neutral-900)] mb-4">
          Desktop Required
        </h1>

        {/* Description */}
        <p className="text-lg text-[var(--color-neutral-600)] mb-8 leading-relaxed">
          DSG Medical Summary requires a desktop or laptop computer for the best experience. 
          Please access this application from a device with a larger screen.
        </p>

        {/* Features List */}
        <div className="text-left space-y-3 mb-8">
          <div className="flex items-center gap-3 text-[var(--color-neutral-700)]">
            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
            <span>Optimized for professional medical workflow</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--color-neutral-700)]">
            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
            <span>Requires minimum 1080px screen width</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--color-neutral-700)]">
            <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full"></div>
            <span>Best experienced on Chrome, Firefox, or Safari</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-sm text-[var(--color-neutral-500)]">
          Need help? Contact support at{" "}
          <a href="mailto:revivewebsites@outlook.com" className="text-[var(--color-primary)] hover:underline">
            revivewebsites@outlook.com
          </a>
        </div>
      </div>
    </div>
  );
} 