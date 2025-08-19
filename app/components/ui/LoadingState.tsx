import React from "react";

export default function LoadingState() {
  return (
    <div className="h-full w-full flex items-center justify-center px-4 py-8 sm:py-0">
      <div className="text-center max-w-sm sm:max-w-md mx-auto">
        <div className="mb-6 sm:mb-8">
          <div
            className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 rounded-full animate-spin"
            role="status"
            aria-live="polite"
            aria-label="Processing"
            style={{
              borderColor: 'var(--color-neutral-200)',
              borderTopColor: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
          >
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
          Processing your medical notes
        </h2>

        <p className="text-sm sm:text-base mb-6 sm:mb-8" style={{ color: 'var(--color-neutral-600)' }}>
          This usually takes 5-20 seconds
        </p>

        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-neutral-500)' }}>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: 'var(--color-primary)'
              }}
            >
            </div>
            <span>Analyzing medical notes</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: 'var(--color-primary)',
                animationDelay: '0.2s'
              }}
            >
            </div>
            <span>Generating summary</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: 'var(--color-primary)',
                animationDelay: '0.4s'
              }}
            >
            </div>
            <span>Creating discharge plan</span>
          </div>
        </div>
      </div>
    </div>
  );
} 

