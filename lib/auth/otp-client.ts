'use client'

import React from 'react'
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'

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
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }>
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string; session?: any; remaining?: number; resetTime?: number }>
  resendOTP: (phoneNumber: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }>
  resetOTPState: () => void
}

/**
 * Custom hook for OTP state management
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

  const resetOTPState = () => {
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
  }

  const updateState = (updates: Partial<OTPState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  return {
    state,
    updateState,
    resetOTPState,
  }
}

/**
 * Timer utilities for OTP countdown
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

  const startTimers = () => {
    setOTPTimer(60) // 1 minute
    setOTPResendTimer(60) // 1 minute cooldown for resend
  }

  const resetTimers = () => {
    setOTPTimer(0)
    setOTPResendTimer(0)
  }

  return {
    otpTimer,
    otpResendTimer,
    startTimers,
    resetTimers,
  }
}

/**
 * Client-side OTP service that calls API routes
 */
export class OTPClientService {
  /**
   * Check if a user exists by normalized phone number
   */
  private async checkUserExists(normalizedPhone: string): Promise<boolean> {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Try to sign in with OTP without creating a user
      // If this succeeds, the user exists
      // If it fails with "Signups not allowed" or "User not found", the user doesn't exist
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: false, // Don't create user if they don't exist
        }
      })

      if (error) {
        // Check if the error indicates user doesn't exist
        if (error.message.includes('Signups not allowed') || 
            error.message.includes('User not found') ||
            error.message.includes('Invalid login credentials')) {
          console.log('🔍 User does not exist:', normalizedPhone)
          return false
        }
        // For other errors, log and assume user doesn't exist
        console.log('🔍 User existence check error:', error.message)
        return false
      }

      // If no error, user exists
      console.log('🔍 User exists:', normalizedPhone)
      return true
    } catch (error) {
      console.log('🔍 User existence check failed:', error)
      return false
    }
  }

  /**
   * Send OTP via API route
   */
  async sendOTP(phoneNumber: string, captchaToken?: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }> {
    try {
      // Validate phone number first
      const validation = validateUKPhoneNumber(phoneNumber)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Normalize phone number
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      if (!normalizedPhone) {
        return { success: false, error: "Invalid phone number format" }
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
        resetTime: result.resetTime || 0
      }
    } catch (error) {
      console.log('❌ OTP Client: Send OTP unexpected error:', error)
      return { 
        success: false, 
        error: "An unexpected error occurred. Please try again." 
      }
    }
  }

  /**
   * Verify OTP via API route
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string; session?: any; remaining?: number; resetTime?: number }> {
    return new Promise(async (resolve) => {
      try {
        // Validate phone number first
        const phoneValidation = validateUKPhoneNumber(phoneNumber)
        if (!phoneValidation.valid) {
          resolve({ success: false, error: phoneValidation.error })
          return
        }

        // Normalize phone number
        const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
        if (!normalizedPhone) {
          resolve({ success: false, error: "Invalid phone number format" })
          return
        }

        // Import the client-side Supabase client
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        // Set up auth state listener to detect successful verification
        let authStateResolved = false;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session && !authStateResolved) {
            authStateResolved = true;
            subscription.unsubscribe();
            resolve({ 
              success: true, 
              session,
              remaining: 0,
              resetTime: 0
            });
          }
        });
        
        // Attempt verification
        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          phone: normalizedPhone,
          token: otp,
          type: 'sms',
        });

        if (error) {
          console.log('❌ OTP Client: Supabase error:', error.message, error)
          subscription.unsubscribe();
          
          // Handle specific error types
          if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
            resolve({ success: false, error: "Verification code expired or invalid. Please request a new code." })
          } else if (error.message?.includes('Invalid OTP') || error.message?.includes('Invalid token')) {
            resolve({ success: false, error: "Invalid verification code. Please check and try again." })
          } else {
            resolve({ success: false, error: error.message })
          }
          return;
        }

        // If we got a session directly, use it
        if (session && !authStateResolved) {
          authStateResolved = true;
          subscription.unsubscribe();
          resolve({ 
            success: true, 
            session,
            remaining: 0,
            resetTime: 0
          });
          return;
        }

        // If no session and no error, wait a bit for auth state change
        if (!authStateResolved) {
          setTimeout(() => {
            if (!authStateResolved) {
              subscription.unsubscribe();
              resolve({ success: false, error: "Verification failed" });
            }
          }, 3000); // Wait 3 seconds for auth state change
        }
      } catch (error) {
        resolve({ 
          success: false, 
          error: "An unexpected error occurred. Please try again." 
        });
      }
    });
  }

  /**
   * Resend OTP via API route
   */
  async resendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }> {
    try {
      // Validate phone number first
      const validation = validateUKPhoneNumber(phoneNumber)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Normalize phone number
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      if (!normalizedPhone) {
        return { success: false, error: "Invalid phone number format" }
      }

      // Import the client-side Supabase client
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Try to resend OTP for existing user first
      console.log('📱 Attempting to resend OTP for existing user:', normalizedPhone)
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: false, // Don't create user if they don't exist
        }
      })

      if (error) {
        // Check if the error indicates user doesn't exist
        if (error.message.includes('Signups not allowed') || 
            error.message.includes('User not found') ||
            error.message.includes('Invalid login credentials')) {
          
          console.log('📱 User not found during resend, creating new account with OTP')
          // User doesn't exist, create new user with OTP
          const { error: signUpError } = await supabase.auth.signInWithOtp({
            phone: normalizedPhone,
            options: {
              shouldCreateUser: true, // Create user for new signups
            }
          })

          if (signUpError) {
            return { success: false, error: signUpError.message }
          }

          return { 
            success: true,
            remaining: 0,
            resetTime: 0
          }
        } else {
          // Other error occurred
          return { success: false, error: error.message }
        }
      }

      // If no error, OTP was resent successfully to existing user
      console.log('📱 OTP resent successfully to existing user')
      return { 
        success: true,
        remaining: 0,
        resetTime: 0
      }
    } catch (error) {
      return { 
        success: false, 
        error: "Failed to resend code. Please try again." 
      }
    }
  }
}

// Create a singleton instance
export const otpClientService = new OTPClientService()

// Test function to check Supabase connection
export async function testSupabaseConnection() {
  try {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      return false
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * Utility function to format time for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
} 