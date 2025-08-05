import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone'
import { 
  validateOTP, 
  isUserNotFoundError, 
  isOTPExpiredError,
  isInvalidOTPError,
  OTP_ERROR_MESSAGES, 
  OTP_CONSTANTS 
} from './otp-utils'
import type { Session } from '@supabase/supabase-js'

export interface ClientAuthResult {
  success: boolean
  error?: string
  session?: Session | null
  isNewUser?: boolean
  rateLimited?: boolean
  timeUntilReset?: number
}

/**
 * Client-side authentication service for OTP-based phone authentication
 * Handles sign in, sign up, and OTP verification using Supabase client
 */
export class ClientAuthService {
  /**
   * Check if a user exists by normalized phone number
   * @param normalizedPhone - The normalized phone number to check
   * @returns Promise<boolean> - True if user exists, false otherwise
   */
  async checkUserExists(normalizedPhone: string): Promise<boolean> {
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
        if (isUserNotFoundError(error.message)) {
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
      console.error('🔍 User existence check failed:', error)
      return false
    }
  }

  /**
   * Attempt to sign in existing user with OTP
   * @param phoneNumber - The phone number to sign in with
   * @returns Promise<ClientAuthResult> - Result of the sign in attempt
   */
  async signInWithOTP(phoneNumber: string): Promise<ClientAuthResult> {
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }

      console.log('🔐 Client: Attempting to sign in existing user:', normalizedPhone)
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
      console.error('❌ Client Auth Service: Sign in error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Send OTP for new user signup
   * @param phoneNumber - The phone number to send OTP to
   * @returns Promise<ClientAuthResult> - Result of the OTP send attempt
   */
  async sendSignupOTP(phoneNumber: string): Promise<ClientAuthResult> {
    // STRICT validation - reject any invalid phone numbers
    const validation = validateUKPhoneNumber(phoneNumber)
    if (!validation.valid) {
      console.log('❌ SendSignupOTP: Invalid phone number rejected:', phoneNumber, validation.error);
      return { success: false, error: validation.error }
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
      
      if (!normalizedPhone) {
        console.log('❌ SendSignupOTP: Failed to normalize phone number:', phoneNumber);
        return { success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT }
      }

      // Double-check normalization is valid
      const normalizedValidation = validateUKPhoneNumber(normalizedPhone)
      if (!normalizedValidation.valid) {
        console.log('❌ SendSignupOTP: Normalized phone number is still invalid:', normalizedPhone);
        return { success: false, error: normalizedValidation.error }
      }

      console.log('📝 Client: Sending OTP for new user signup:', normalizedPhone)
      
      // Send OTP with shouldCreateUser: true to allow OTP delivery for new users
      // This follows the standard Supabase pattern for signup flows
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          shouldCreateUser: true, // Allow OTP to be sent for new users
        }
      })

      if (error) {
        console.log('❌ SendSignupOTP: Failed to send OTP:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ SendSignupOTP: OTP sent successfully for new user');
      return { success: true, isNewUser: true }
    } catch (error) {
      console.error('❌ Client Auth Service: Send signup OTP error:', error)
      return { 
        success: false, 
        error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
      }
    }
  }

  /**
   * Sign up new user with OTP (DEPRECATED - use sendSignupOTP instead)
   * @param phoneNumber - The phone number to create account for
   * @returns Promise<ClientAuthResult> - Result of the sign up attempt
   */
  async signUpWithOTP(phoneNumber: string): Promise<ClientAuthResult> {
    // Use the new method instead
    return this.sendSignupOTP(phoneNumber)
  }

  /**
   * Smart sign in/sign up - tries sign in first, falls back to sign up
   * This provides a seamless experience for both new and existing users
   * @param phoneNumber - The phone number to authenticate
   * @returns Promise<ClientAuthResult> - Result of the authentication attempt
   */
  async signInOrSignUp(phoneNumber: string): Promise<ClientAuthResult> {
    // First try to sign in existing user
    const signInResult = await this.signInWithOTP(phoneNumber)
    
    if (signInResult.success) {
      return signInResult
    }

    // Check if the error indicates user doesn't exist
    if (signInResult.error && isUserNotFoundError(signInResult.error)) {
      console.log('🔄 Client: User not found, attempting sign up')
      return await this.signUpWithOTP(phoneNumber)
    }

    // Return the original error if it's not a "user not found" error
    return signInResult
  }

  /**
   * Verify OTP code with auth state listener for real-time updates
   * @param phoneNumber - The phone number the OTP was sent to
   * @param otp - The 6-digit OTP code to verify
   * @returns Promise<ClientAuthResult> - Result of the verification attempt
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<ClientAuthResult> {
    return new Promise(async (resolve) => {
      try {
        const phoneValidation = validateUKPhoneNumber(phoneNumber)
        if (!phoneValidation.valid) {
          resolve({ success: false, error: phoneValidation.error })
          return
        }

        const otpValidation = validateOTP(otp)
        if (!otpValidation.valid) {
          resolve({ success: false, error: otpValidation.error })
          return
        }

        const normalizedPhone = normalizeUKPhoneNumber(phoneNumber)
        if (!normalizedPhone) {
          resolve({ success: false, error: OTP_ERROR_MESSAGES.INVALID_PHONE_FORMAT })
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
              isNewUser: true // Assume new user for signup flow
            });
          }
        });
        
        // Attempt verification
        const { data: { session }, error } = await supabase.auth.verifyOtp({
          phone: normalizedPhone,
          token: otp,
          type: 'sms',
        });

        if (error) {
          console.error('❌ Client: Supabase error:', error.message, error)
          subscription.unsubscribe();
          
          // Handle specific error types using utility functions
          if (isOTPExpiredError(error.message)) {
            resolve({ success: false, error: OTP_ERROR_MESSAGES.EXPIRED_OTP })
          } else if (isInvalidOTPError(error.message)) {
            resolve({ success: false, error: OTP_ERROR_MESSAGES.INVALID_CODE })
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
            isNewUser: true // Assume new user for signup flow
          });
          return;
        }

        // If no session and no error, wait a bit for auth state change
        if (!authStateResolved) {
          setTimeout(() => {
            if (!authStateResolved) {
              subscription.unsubscribe();
              resolve({ success: false, error: OTP_ERROR_MESSAGES.VERIFICATION_FAILED });
            }
          }, OTP_CONSTANTS.AUTH_STATE_TIMEOUT);
        }
      } catch (error) {
        console.error('❌ Client Auth Service: OTP verification unexpected error:', error)
        resolve({ 
          success: false, 
          error: OTP_ERROR_MESSAGES.UNEXPECTED_ERROR
        });
      }
    });
  }

  /**
   * Test Supabase connection
   * @returns Promise<boolean> - True if connection is successful, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Client Auth Service: Connection test failed:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Client Auth Service: Connection test error:', error)
      return false
    }
  }
}

// Create a singleton instance
export const clientAuthService = new ClientAuthService() 