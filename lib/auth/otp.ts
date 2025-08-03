import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'
import { captchaService } from './captcha'
import { authService } from './auth-service'
import { validateOTP, OTP_ERROR_MESSAGES } from './otp-utils'
import type { Session } from '@supabase/supabase-js'

export interface OTPResult {
  success: boolean
  error?: string
  session?: Session | null
}

export interface SendOTPRequest {
  phoneNumber: string
  captchaToken?: string
  ipAddress?: string
}

/**
 * Server-side OTP service for handling OTP operations with security features
 * Integrates CAPTCHA verification, rate limiting, and smart auth logic
 */
export class OTPService {
  /**
   * Send OTP to phone number with optional CAPTCHA verification
   * @param request - The OTP request containing phone number and optional CAPTCHA token
   * @returns Promise<OTPResult> - Result of the OTP sending attempt
   */
  async sendOTP(request: SendOTPRequest): Promise<OTPResult> {
    const { phoneNumber, captchaToken, ipAddress } = request
    
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
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
      
      // Use the auth service for smart sign in/sign up
      const result = await authService.signInOrSignUp(phoneNumber)
      
      if (result.success) {
        console.log(`📱 Server: OTP sent successfully to ${result.isNewUser ? 'new' : 'existing'} user`)
      }
      
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('❌ OTP Service: Send OTP unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Verify OTP code using the auth service
   * @param phoneNumber - The phone number the OTP was sent to
   * @param otp - The 6-digit OTP code to verify
   * @returns Promise<OTPResult> - Result of the verification attempt
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<OTPResult> {
    const phoneValidation = validateUKPhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      return { success: false, error: phoneValidation.error }
    }

    const otpValidation = validateOTP(otp)
    if (!otpValidation.valid) {
      return { success: false, error: otpValidation.error }
    }

    // Use the auth service for verification
    return await authService.verifyOTP(phoneNumber, otp)
  }

  /**
   * Resend OTP to phone number using smart auth logic
   * @param phoneNumber - The phone number to resend OTP to
   * @returns Promise<OTPResult> - Result of the resend attempt
   */
  async resendOTP(phoneNumber: string): Promise<OTPResult> {
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      // Use the auth service for smart sign in/sign up
      const result = await authService.signInOrSignUp(phoneNumber)
      
      if (result.success) {
        console.log(`📱 Server: OTP resent successfully to ${result.isNewUser ? 'new' : 'existing'} user`)
      }
      
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('❌ OTP Service: Resend OTP unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.RESEND_FAILED
      }
    }
  }
}

// Create a singleton instance
export const otpService = new OTPService()

// Re-export utilities for backward compatibility
export { validateUKPhoneNumber } from '@/lib/utils/phone'
export { validateOTP, formatTime } from './otp-utils' 