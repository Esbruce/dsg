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
          Phone Number (with country code)
        </label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          placeholder="+15551234567"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-transparent text-gray-900 placeholder-gray-500"
          disabled={isProcessing}
        />
        <p className="mt-1 text-xs text-gray-500">
          Include your country code (e.g., +1 for US, +44 for UK)
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