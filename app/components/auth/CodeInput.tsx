'use client'

import React from 'react';
import { formatTime } from '@/lib/auth/otp-client';
import { formatUKPhoneForDisplay, normalizeUKPhoneNumber } from '@/lib/utils/phone';

interface CodeInputProps {
  phoneNumber: string;
  otp: string;
  onOTPChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onBackToPhone: () => void;
  isProcessing: boolean;
  error: string;
  otpTimer: number;
  otpResendTimer: number;
  resendError: string;
}

export default function CodeInput({ 
  phoneNumber, 
  otp, 
  onOTPChange, 
  onSubmit, 
  onResend, 
  onBackToPhone,
  isProcessing, 
  error, 
  otpTimer, 
  otpResendTimer, 
  resendError 
}: CodeInputProps) {

  // Format the phone number for display
  const displayPhoneNumber = React.useMemo(() => {
    // First normalize the phone number to ensure it has +44 prefix
    const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
    if (normalizedPhone) {
      // Then format it for display
      return formatUKPhoneForDisplay(normalizedPhone)
    }
    // Fallback to original if normalization fails
    return phoneNumber
  }, [phoneNumber])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
          Verification Code
        </label>
        <p className="text-sm text-gray-600 mb-2">
          We sent a code to <span className="font-medium">{displayPhoneNumber}</span>
        </p>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={onOTPChange}
          placeholder="123456"
          maxLength={6}
          className="w-full px-4 py-3 border border-[var(--color-neutral-300)] rounded-lg focus:border-transparent text-center text-xl tracking-widest text-gray-900 placeholder-gray-500"
          disabled={isProcessing}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          aria-label="Verification code"
          enterKeyHint="done"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {otpTimer > 0 && (
        <p className="text-sm text-gray-600 text-center">
          Code expires in {formatTime(otpTimer)}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing || !otp || otp.length !== 6}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        {isProcessing ? "Verifying..." : "Verify Code"}
      </button>

      <div className="text-center">
        {otpResendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend code in {formatTime(otpResendTimer)}
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline"
          >
            Resend Code
          </button>
        )}
        {resendError && (
          <p className="mt-1 text-sm text-red-600">{resendError}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onBackToPhone}
        className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm underline"
      >
        Use a different phone number
      </button>
    </form>
  );
} 