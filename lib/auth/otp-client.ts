'use client'

import React from 'react'

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
  sendOTP: (phoneNumber: string, captchaToken?: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }>
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; error?: string; session?: any; remaining?: number; resetTime?: number }>
  resendOTP: (phoneNumber: string, captchaToken?: string) => Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }>
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
   * Send OTP via API route
   */
  async sendOTP(phoneNumber: string, captchaToken?: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }> {
    try {
      // Import the client-side Supabase client
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Format phone number - ensure it has country code
      let formattedPhone = phoneNumber.replace(/[^\d+]/g, '')
      if (!formattedPhone.startsWith('+')) {
        // Assume US number if no country code
        formattedPhone = '+1' + formattedPhone
      }
      
      console.log('🔍 OTP Client: Sending OTP to', formattedPhone)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true, // Create user if doesn't exist
        }
      })

      if (error) {
        console.log('❌ OTP Client: Send OTP error:', error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ OTP Client: OTP sent successfully', data)
      return { 
        success: true,
        remaining: 0,
        resetTime: 0
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
    console.log('🔍 OTP Client: Starting verification for', phoneNumber)
    
    return new Promise(async (resolve) => {
      try {
        // Import the client-side Supabase client
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        // Format phone number - ensure it has country code
        let formattedPhone = phoneNumber.replace(/[^\d+]/g, '')
        if (!formattedPhone.startsWith('+')) {
          // Assume US number if no country code
          formattedPhone = '+1' + formattedPhone
        }
        
        console.log('🔍 OTP Client: Calling Supabase verifyOtp with:', {
          phone: formattedPhone,
          token: otp ? '***' : 'missing',
          type: 'sms'
        })
        
        // Set up auth state listener to detect successful verification
        let authStateResolved = false;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session && !authStateResolved) {
            console.log('✅ OTP Client: Auth state change detected - SIGNED_IN')
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
          phone: formattedPhone,
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
          console.log('✅ OTP Client: Verification successful, session created directly', session)
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
          console.log('🔍 OTP Client: No immediate session, waiting for auth state change...')
          setTimeout(() => {
            if (!authStateResolved) {
              console.log('❌ OTP Client: No auth state change detected, verification failed')
              subscription.unsubscribe();
              resolve({ success: false, error: "Verification failed" });
            }
          }, 3000); // Wait 3 seconds for auth state change
        }
      } catch (error) {
        console.log('❌ OTP Client: Unexpected error:', error)
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
  async resendOTP(phoneNumber: string, captchaToken?: string): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }> {
    try {
      // Import the client-side Supabase client
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Format phone number - ensure it has country code
      let formattedPhone = phoneNumber.replace(/[^\d+]/g, '')
      if (!formattedPhone.startsWith('+')) {
        // Assume US number if no country code
        formattedPhone = '+1' + formattedPhone
      }
      
      console.log('🔍 OTP Client: Resending OTP to', formattedPhone)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        console.log('❌ OTP Client: Resend OTP error:', error.message)
        return { success: false, error: error.message }
      }

      console.log('✅ OTP Client: OTP resent successfully')
      return { 
        success: true,
        remaining: 0, // Not applicable for client-side
        resetTime: 0
      }
    } catch (error) {
      console.log('❌ OTP Client: Resend OTP unexpected error:', error)
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
    
    console.log('🔍 Testing Supabase connection...')
    console.log('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔍 Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('❌ Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection test successful')
    return true
  } catch (error) {
    console.log('❌ Supabase connection test error:', error)
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