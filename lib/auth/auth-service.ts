import { createClient } from '@/lib/supabase/server'
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'
import { validateOTP, isUserNotFoundError, OTP_ERROR_MESSAGES } from './otp-utils'
import type { Session } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  session?: Session | null
  isNewUser?: boolean
}

/**
 * Server-side authentication service for OTP-based phone authentication
 * Handles sign in, sign up, and OTP verification using Supabase
 */
export class AuthService {
  /**
   * Attempt to sign in existing user with OTP
   * @param phoneNumber - The phone number to sign in with
   * @returns Promise<AuthResult> - Result of the sign in attempt
   */
  async signInWithOTP(phoneNumber: string): Promise<AuthResult> {
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }

      console.log('🔐 Attempting to sign in existing user:', normalizedPhone)
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: false, // Don't create user if they don't exist
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, isNewUser: false }
    } catch (error) {
      console.error('❌ Auth Service: Sign in error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Sign up new user with OTP
   * @param phoneNumber - The phone number to create account for
   * @returns Promise<AuthResult> - Result of the sign up attempt
   */
  async signUpWithOTP(phoneNumber: string): Promise<AuthResult> {
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }

      console.log('📝 Creating new user account:', normalizedPhone)
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: true, // Create user for new signups
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, isNewUser: true }
    } catch (error) {
      console.error('❌ Auth Service: Sign up error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Smart sign in/sign up - tries sign in first, falls back to sign up
   * This provides a seamless experience for both new and existing users
   * @param phoneNumber - The phone number to authenticate
   * @returns Promise<AuthResult> - Result of the authentication attempt
   */
  async signInOrSignUp(phoneNumber: string): Promise<AuthResult> {
    // First try to sign in existing user
    const signInResult = await this.signInWithOTP(phoneNumber)
    
    if (signInResult.success) {
      return signInResult
    }

    // Check if the error indicates user doesn't exist
    if (signInResult.error && isUserNotFoundError(signInResult.error)) {
      console.log('🔄 User not found, attempting sign up')
      return await this.signUpWithOTP(phoneNumber)
    }

    // Return the original error if it's not a "user not found" error
    return signInResult
  }

  /**
   * Verify OTP code and return session if successful
   * @param phoneNumber - The phone number the OTP was sent to
   * @param otp - The 6-digit OTP code to verify
   * @returns Promise<AuthResult> - Result of the verification attempt
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResult> {
    const phoneValidation = validateUKPhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      return { success: false, error: phoneValidation.error }
    }

    const otpValidation = validateOTP(otp)
    if (!otpValidation.valid) {
      return { success: false, error: otpValidation.error }
    }

    try {
      const supabase = await createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }
      
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: otp,
        type: 'sms',
      })

      if (error) {
        console.error('❌ Auth Service: OTP verification error:', error)
        return { success: false, error: error.message }
      }

      if (session) {
        return { success: true, session }
      }

      return { success: false, error: OTP_ERROR_MESSAGES.VERIFICATION_FAILED }
    } catch (error) {
      console.error('❌ Auth Service: OTP verification unexpected error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }
}

// Create a singleton instance
export const authService = new AuthService() 