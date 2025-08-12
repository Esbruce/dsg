'use client'

import React, { useState, useEffect } from 'react';
import { validateUKPhoneNumber } from '@/lib/utils/phone';

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isProcessing: boolean;
  error: string;
}

export default function PhoneInput({ phoneNumber, onPhoneNumberChange, onSubmit, isProcessing, error }: PhoneInputProps) {
  const [validationError, setValidationError] = useState<string>("");

  // Validate phone number on every change
  useEffect(() => {
    if (phoneNumber.trim()) {
      const validation = validateUKPhoneNumber(phoneNumber);
      setValidationError(validation.valid ? "" : validation.error || "");
    } else {
      setValidationError("");
    }
  }, [phoneNumber]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Final validation before submitting
    const validation = validateUKPhoneNumber(phoneNumber);
    if (!validation.valid) {
      console.log('❌ PhoneInput: Form submission blocked - invalid phone number:', phoneNumber, validation.error);
      setValidationError(validation.error || "Invalid phone number");
      return;
    }
    
    console.log('✅ PhoneInput: Form submission allowed - valid phone number:', phoneNumber);
    onSubmit(e);
  };

  const isFormValid = phoneNumber.trim() && !validationError && validateUKPhoneNumber(phoneNumber).valid;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {(error || validationError) && (
          <p className="mt-1 text-sm text-red-600">{error || validationError}</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        By using DSG you are accepting the{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          Terms of Service
        </a>{' '}and{' '}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          Privacy Policy
        </a>.
      </p>

      <button
        type="submit"
        disabled={isProcessing || !isFormValid}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
      >
        {isProcessing ? "Sending..." : "Send Code"}
      </button>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Debug: Phone valid: {validateUKPhoneNumber(phoneNumber).valid ? '✅' : '❌'} | 
          Length: {phoneNumber.length} | 
          Form valid: {isFormValid ? '✅' : '❌'}
        </div>
      )}
    </form>
  );
} 