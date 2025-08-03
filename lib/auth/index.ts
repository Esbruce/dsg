// Core auth services
export { authService } from './auth-service'
export { clientAuthService } from './client-auth-service'
export { otpService } from './otp'
export { otpClientService } from './otp-client'

// OTP utilities and constants
export { 
  validateOTP, 
  formatTime, 
  isUserNotFoundError,
  isOTPExpiredError,
  isInvalidOTPError,
  OTP_CONSTANTS,
  OTP_ERROR_MESSAGES 
} from './otp-utils'

// React hooks and state management
export { 
  useOTPState, 
  useOTPTimers 
} from './otp-client'

// Types
export type { 
  AuthResult 
} from './auth-service'

export type { 
  ClientAuthResult 
} from './client-auth-service'

export type { 
  OTPResult,
  SendOTPRequest 
} from './otp'

export type { 
  OTPState, 
  OTPActions
} from './otp-client'

// Backward compatibility exports
export { validateUKPhoneNumber } from '@/lib/utils/phone' 