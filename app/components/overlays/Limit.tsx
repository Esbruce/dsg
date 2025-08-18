'use client';

import React from 'react';

interface LimitProps {
  onUpgrade: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function Limit({ onUpgrade, onClose, isVisible }: LimitProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto border border-[var(--color-border-3)] relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] rounded-full"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-neutral-900)] mb-4">
          Rate Limit Reached
        </h2>
        <p className="text-[var(--color-neutral-600)] text-lg leading-relaxed">
          Sorry, you have reached your daily rate limit. You can upgrade to unlock unlimited access — or invite friends to get unlimited as well.
        </p>
      </div>

      {/* Upgrade Button */}
      <button
        onClick={onUpgrade}
        className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-4 px-6 rounded-xl shadow-md"
      >
        Upgrade Now
      </button>

      {/* Additional Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-[var(--color-neutral-500)]">
          Starting at £2.50/month • Cancel anytime
        </p>
      </div>
    </div>
  );
}
