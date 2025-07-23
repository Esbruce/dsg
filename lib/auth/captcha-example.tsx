'use client'

import React, { useEffect, useRef } from 'react'

// Type declaration for Google reCAPTCHA
declare global {
  interface Window {
    grecaptcha?: {
      render: (element: HTMLElement | null, options: any) => number
    }
  }
}

interface CaptchaExampleProps {
  onCaptchaToken: (token: string) => void
  onCaptchaError: (error: string) => void
}

/**
 * Example component showing how to integrate Google reCAPTCHA
 * This is just an example - you'll need to implement the actual CAPTCHA integration
 * based on your preferred CAPTCHA provider (Google reCAPTCHA, hCaptcha, etc.)
 */
export default function CaptchaExample({ onCaptchaToken, onCaptchaError }: CaptchaExampleProps) {
  const captchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Example: Load Google reCAPTCHA
    // You would need to:
    // 1. Add the reCAPTCHA script to your HTML
    // 2. Configure it with your site key
    // 3. Handle the callback
    
    const loadCaptcha = () => {
      // This is pseudo-code - replace with actual reCAPTCHA implementation
      if (typeof window !== 'undefined' && window.grecaptcha) {
        window.grecaptcha.render(captchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: (token: string) => {
            onCaptchaToken(token)
          },
          'expired-callback': () => {
            onCaptchaError('CAPTCHA expired. Please try again.')
          },
          'error-callback': () => {
            onCaptchaError('CAPTCHA error. Please try again.')
          }
        })
      }
    }

    // Load CAPTCHA when component mounts
    loadCaptcha()
  }, [onCaptchaToken, onCaptchaError])

  return (
    <div className="mt-4">
      <div ref={captchaRef} className="flex justify-center" />
      <p className="text-xs text-gray-500 mt-2 text-center">
        This helps us prevent automated abuse
      </p>
    </div>
  )
}

/*
 * Example of how to use CAPTCHA with OTP in a component:
 * 
 * import { otpClientService } from '@/lib/auth/otp-client'
 * import CaptchaExample from '@/lib/auth/captcha-example'
 * 
 * function MyOTPComponent() {
 *   const [captchaToken, setCaptchaToken] = useState('')
 *   const [captchaError, setCaptchaError] = useState('')
 * 
 *   const handleSendOTP = async (phoneNumber: string) => {
 *     const result = await otpClientService.sendOTP(phoneNumber, captchaToken)
 *     if (!result.success) {
 *       // Handle error
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       <CaptchaExample 
 *         onCaptchaToken={setCaptchaToken}
 *         onCaptchaError={setCaptchaError}
 *       />
 *       {captchaError && <p className="text-red-600">{captchaError}</p>}
 *       <button onClick={() => handleSendOTP(phoneNumber)}>
 *         Send OTP
 *       </button>
 *     </div>
 *   )
 * }
 */ 