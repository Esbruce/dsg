'use client'

import React from 'react'
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'
import { clientAuthService } from './client-auth-service'
import { validateOTP, OTP_ERROR_MESSAGES, OTP_CONSTANTS } from './otp-utils'
import type { Session } from '@supabase/supabase-js'

export interface OTPState {
  otp: string
  otpError: string
  otpProcessing: boolean
  otpSent: boolean
  otpTimer: number
  otpResendTimer: number
  otpResendError: string
  isOTPVerified: boolean
}

export interface OTPActions {
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }>
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string; session?: Session | null; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }>
  resendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }>
  resetOTPState: () => void
}

/**
 * Custom hook for OTP state management
 * Provides state and methods for managing OTP flow in React components
 */
export function useOTPState() {
  const [state, setState] = React.useState<OTPState>({
    otp: "",
    otpError: "",
    otpProcessing: false,
    otpSent: false,
    otpTimer: 0,
    otpResendTimer: 0,
    otpResendError: "",
    isOTPVerified: false,
  })

  const resetOTPState = React.useCallback(() => {
    setState({
      otp: "",
      otpError: "",
      otpProcessing: false,
      otpSent: false,
      otpTimer: 0,
      otpResendTimer: 0,
      otpResendError: "",
      isOTPVerified: false,
    })
  }, [])

  const updateState = React.useCallback((updates: Partial<OTPState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    state,
    updateState,
    resetOTPState,
  }
}

/**
 * Timer utilities for OTP countdown and resend cooldown
 * Manages countdown timers for OTP expiration and resend restrictions
 */
export function useOTPTimers() {
  const [otpTimer, setOTPTimer] = React.useState(0)
  const [otpResendTimer, setOTPResendTimer] = React.useState(0)

  // Timer effect for OTP expiration
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOTPTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  // Timer effect for resend cooldown
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpResendTimer > 0) {
      interval = setInterval(() => {
        setOTPResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpResendTimer])

  const startTimers = React.useCallback(() => {
    setOTPTimer(OTP_CONSTANTS.OTP_TIMEOUT)
    setOTPResendTimer(OTP_CONSTANTS.RESEND_COOLDOWN)
  }, [])

  const resetTimers = React.useCallback(() => {
    setOTPTimer(0)
    setOTPResendTimer(0)
  }, [])

  return {
    otpTimer,
    otpResendTimer,
    startTimers,
    resetTimers,
  }
}

/**
 * Client-side OTP service that handles API calls and client-side operations
 * Provides methods for sending, verifying, and resending OTP codes
 */
export class OTPClientService {
  /**
   * Send OTP via API route with optional CAPTCHA verification
   * @param phoneNumber - The phone number to send OTP to
   * @param captchaToken - Optional CAPTCHA token for verification
   * @returns Promise with success status and rate limiting info
   */
  async sendOTP(phoneNumber: string, captchaToken?: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }> {
    try {
      // Validate phone number first
      const validation = validateUKPhoneNumber(phoneNumber)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Normalize phone number
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }

      // Call API route with CAPTCHA token
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          captchaToken
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { 
          success: false, 
          error: result.error || 'Failed to send OTP'
        }
      }

      return { 
        success: true,
        remaining: result.remaining || 0,
        resetTime: result.resetTime || 0,
        rateLimited: result.rateLimited || false,
        timeUntilReset: result.timeUntilReset || 0
      }
    } catch (error) {
      console.error('❌ OTP Client: Send OTP unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Verify OTP using client auth service with real-time session updates
   * @param phoneNumber - The phone number the OTP was sent to
   * @param otp - The 6-digit OTP code to verify
   * @returns Promise with verification result and session info
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string; session?: Session | null; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }> {
    try {
      // Validate phone number first
      const phoneValidation = validateUKPhoneNumber(phoneNumber)
      if (!phoneValidation.valid) {
        return { success: false, error: phoneValidation.error }
      }

      // Validate OTP format
      const otpValidation = validateOTP(otp)
      if (!otpValidation.valid) {
        return { success: false, error: otpValidation.error }
      }

      // Use client auth service for verification
      const result = await clientAuthService.verifyOTP(phoneNumber, otp)
      
      return { 
        success: result.success, 
        error: result.error,
        session: result.session,
        remaining: 0,
        resetTime: 0,
        rateLimited: result.rateLimited || false,
        timeUntilReset: result.timeUntilReset || 0
      }
    } catch (error) {
      console.error('❌ OTP Client: Verify OTP unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Resend OTP using client auth service with smart user detection
   * @param phoneNumber - The phone number to resend OTP to
   * @returns Promise with resend result and rate limiting info
   */
  async resendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number; rateLimited?: boolean; timeUntilReset?: number }> {
    try {
      // Validate phone number first
      const validation = validateUKPhoneNumber(phoneNumber)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Use client auth service for smart sign in/sign up
      const result = await clientAuthService.signInOrSignUp(phoneNumber)
      
      if (result.success) {
        console.log(`📱 Client: OTP resent successfully to ${result.isNewUser ? 'new' : 'existing'} user`)
      }

      return { 
        success: result.success,
        error: result.error,
        remaining: 0,
        resetTime: 0,
        rateLimited: result.rateLimited || false,
        timeUntilReset: result.timeUntilReset || 0
      }
    } catch (error) {
      console.error('❌ OTP Client: Resend OTP unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.RESEND_FAILED
      }
    }
  }
}

// Create a singleton instance
export const otpClientService = new OTPClientService()

/**
 * Test function to check Supabase connection
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testSupabaseConnection(): Promise<boolean> {
  return await clientAuthService.testConnection()
}

// Re-export utilities for backward compatibility
export { formatTime } from './otp-utils' 