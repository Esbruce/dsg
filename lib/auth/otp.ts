import { createClient } from '@/lib/supabase/server'
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'
import { captchaService } from './captcha'

export interface OTPResult {
  success: boolean
  error?: string
  session?: any
}

export interface SendOTPRequest {
  phoneNumber: string
  captchaToken?: string
  ipAddress?: string
}

export class OTPService {
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
   * Send OTP to phone number with optional CAPTCHA verification
   */
  async sendOTP(request: SendOTPRequest): Promise<OTPResult> {
    const { phoneNumber, captchaToken, ipAddress } = request
    
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: "Invalid phone number format" }
      }

      // Verify CAPTCHA if token is provided
      if (captchaToken) {
        console.log('🔒 Verifying CAPTCHA token...')
        const captchaResult = await captchaService.verifyToken(captchaToken, ipAddress)
        
        if (!captchaResult.success) {
          console.log('❌ CAPTCHA verification failed:', captchaResult.error)
          return { 
            success: false, 
            error: captchaResult.error || 'CAPTCHA verification failed' 
          }
        }
        
        console.log('✅ CAPTCHA verification successful, score:', captchaResult.score)
      }
      
      // Try to send OTP for existing user first
      console.log('📱 Server: Attempting to send OTP for existing user:', normalizedPhone)
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
          
          console.log('📱 Server: User not found, creating new account with OTP')
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

          return { success: true }
        } else {
          // Other error occurred
          return { success: false, error: error.message }
        }
      }

      // If no error, OTP was sent successfully to existing user
      console.log('📱 Server: OTP sent successfully to existing user')
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
    const phoneValidation = validateUKPhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      return { success: false, error: phoneValidation.error }
    }

    const otpValidation = this.validateOTP(otp)
    if (!otpValidation.valid) {
      return { success: false, error: otpValidation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: "Invalid phone number format" }
      }
      
      // For phone OTP verification, we need to use the correct flow
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
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
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: "Invalid phone number format" }
      }
      
      // Try to resend OTP for existing user first
      console.log('📱 Server: Attempting to resend OTP for existing user:', normalizedPhone)
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
          
          console.log('📱 Server: User not found during resend, creating new account with OTP')
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

          return { success: true }
        } else {
          // Other error occurred
          return { success: false, error: error.message }
        }
      }

      // If no error, OTP was resent successfully to existing user
      console.log('📱 Server: OTP resent successfully to existing user')
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

// Re-export phone utilities for backward compatibility
export { validateUKPhoneNumber } from '@/lib/utils/phone'

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