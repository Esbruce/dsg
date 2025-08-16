/**
 * Utility functions for OTP operations
 */

/**
 * Validate OTP format
 */
export function validateOTP(otp: string): { valid: boolean; error?: string } {
  if (!otp || otp.length !== OTP_CONSTANTS.OTP_LENGTH) {
    return {
      valid: false,
      error: OTP_ERROR_MESSAGES.INVALID_OTP
    }
  }
  
  // Check if OTP contains only digits
  if (!/^\d+$/.test(otp)) {
    return {
      valid: false,
      error: "Please enter a valid 6-digit code (numbers only)"
    }
  }
  
  return { valid: true }
}

/**
 * Format time for display (e.g., "1:30" for 90 seconds)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Check if an error indicates user doesn't exist
 */
export function isUserNotFoundError(error: string): boolean {
  return USER_NOT_FOUND_ERRORS.some(errorType => 
    error.toLowerCase().includes(errorType.toLowerCase())
  )
}

/**
 * Check if an error indicates OTP has expired
 */
export function isOTPExpiredError(error: string): boolean {
  return OTP_EXPIRED_ERRORS.some(errorType => 
    error.toLowerCase().includes(errorType.toLowerCase())
  )
}

/**
 * Check if an error indicates invalid OTP format
 */
export function isInvalidOTPError(error: string): boolean {
  return INVALID_OTP_ERRORS.some(errorType => 
    error.toLowerCase().includes(errorType.toLowerCase())
  )
}

/**
 * Constants for OTP operations
 */
export const OTP_CONSTANTS = {
  OTP_LENGTH: 6,
  OTP_TIMEOUT: 60, // seconds
  RESEND_COOLDOWN: 60, // seconds
  AUTH_STATE_TIMEOUT: 700, // milliseconds
  MAX_RETRY_ATTEMPTS: 3,
  PHONE_NUMBER_MAX_LENGTH: 15,
} as const

/**
 * Error messages for OTP operations
 */
export const OTP_ERROR_MESSAGES = {
  INVALID_OTP: "Please enter a valid 6-digit code",
  EXPIRED_OTP: "Verification code expired or invalid. Please request a new code.",
  INVALID_CODE: "Invalid verification code. Please check and try again.",
  VERIFICATION_FAILED: "Verification failed",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  RESEND_FAILED: "Failed to resend code. Please try again.",
  INVALID_PHONE_FORMAT: "Invalid phone number format",
  PHONE_TOO_LONG: "Phone number is too long",
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please try again later.",
} as const

/**
 * Error patterns for user not found detection
 */
const USER_NOT_FOUND_ERRORS = [
  'Signups not allowed',
  'User not found',
  'Invalid login credentials',
  'User does not exist',
] as const

/**
 * Error patterns for OTP expiration detection
 */
const OTP_EXPIRED_ERRORS = [
  '403',
  'Forbidden',
  'expired',
  'timeout',
  'invalid token',
] as const

/**
 * Error patterns for invalid OTP detection
 */
const INVALID_OTP_ERRORS = [
  'Invalid OTP',
  'Invalid token',
  'Invalid code',
  'Wrong code',
] as const 