'use client'

import React from 'react';

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isProcessing: boolean;
  error: string;
}

export default function PhoneInput({ phoneNumber, onPhoneNumberChange, onSubmit, isProcessing, error }: PhoneInputProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          UK Phone Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">+44</span>
          </div>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={onPhoneNumberChange}
            placeholder="7849 484659"
            className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isProcessing}
            maxLength={11} // UK numbers are max 10 digits + space
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Enter your UK mobile or landline number (e.g., 07849 484659 or 020 7946 0958)
        </p>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isProcessing || !phoneNumber}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
      >
        {isProcessing ? "Sending..." : "Send Code"}
      </button>
    </form>
  );
} 