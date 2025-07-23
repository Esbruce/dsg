import { createClient } from '@/lib/supabase/server'

export interface OTPResult {
  success: boolean
  error?: string
  session?: any
}

export class OTPService {
  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    return phone.replace(/[^\d+]/g, '')
  }

  /**
   * Validate phone number format
   */
  private validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    const cleaned = phone.replace(/[^\d+]/g, '')
    
    if (!phoneRegex.test(cleaned)) {
      return {
        valid: false,
        error: "Please enter a valid phone number with country code (e.g., +1234567890)"
      }
    }
    
    return { valid: true }
  }

  /**
   * Validate OTP format
   */
  private validateOTP(otp: string): { valid: boolean; error?: string } {
    if (!otp || otp.length !== 6) {
      return {
        valid: false,
        error: "Please enter a valid 6-digit code"
      }
    }
    
    return { valid: true }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<OTPResult> {
    const validation = this.validatePhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: "An unexpected error occurred. Please try again." 
      }
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<OTPResult> {
    const phoneValidation = this.validatePhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      return { success: false, error: phoneValidation.error }
    }

    const otpValidation = this.validateOTP(otp)
    if (!otpValidation.valid) {
      return { success: false, error: otpValidation.error }
    }

    try {
      const supabase = await createClient()
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      // For phone OTP verification, we need to use the correct flow
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (session) {
        return { success: true, session }
      }

      return { success: false, error: "Verification failed" }
    } catch (error) {
      return { 
        success: false, 
        error: "An unexpected error occurred. Please try again." 
      }
    }
  }

  /**
   * Resend OTP to phone number
   */
  async resendOTP(phoneNumber: string): Promise<OTPResult> {
    const validation = this.validatePhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const formattedPhone = this.formatPhoneNumber(phoneNumber)
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: "Failed to resend code. Please try again." 
      }
    }
  }
}

// Create a singleton instance
export const otpService = new OTPService()

/**
 * Utility function to format time for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Utility function to validate phone number format
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: "Please enter a valid phone number with country code (e.g., +1234567890)"
    }
  }
  
  return { valid: true }
}

/**
 * Utility function to validate OTP format
 */
export function validateOTP(otp: string): { valid: boolean; error?: string } {
  if (!otp || otp.length !== 6) {
    return {
      valid: false,
      error: "Please enter a valid 6-digit code"
    }
  }
  
  return { valid: true }
} 