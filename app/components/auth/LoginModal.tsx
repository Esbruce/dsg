'use client'

import React, { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation';
import PhoneInput from './PhoneInput';
import CodeInput from './CodeInput';
import SuccessMessage from './SuccessMessage';
import TurnstileCaptcha from './TurnstileCaptcha';
import { otpClientService, useOTPState, useOTPTimers } from '@/lib/auth/otp-client';
import { createUserWithReferral } from '@/lib/auth/referral-client';
import { useRequestIntent } from '@/lib/hooks/useRequestIntent';

// Context for managing modal state
interface LoginModalContextType {
  showInlineLoginModal: () => void
  isInlineLoginModalOpen: boolean
  hideInlineLoginModal: () => void
}

const LoginModalContext = createContext<LoginModalContextType>({
  showInlineLoginModal: () => {},
  isInlineLoginModalOpen: false,
  hideInlineLoginModal: () => {}
})

export const useLoginModal = () => useContext(LoginModalContext)

interface LoginModalProviderProps {
  children: React.ReactNode
}

export function LoginModalProvider({ children }: LoginModalProviderProps) {
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false)

  const showInlineLoginModal = () => {
    setIsInlineModalOpen(true)
  }

  const hideInlineLoginModal = () => {
    setIsInlineModalOpen(false)
  }

  return (
    <LoginModalContext.Provider value={{ 
      showInlineLoginModal, 
      isInlineLoginModalOpen: isInlineModalOpen,
      hideInlineLoginModal 
    }}>
      {children}
    </LoginModalContext.Provider>
  )
}



// Main Login Modal Component
interface LoginModalProps {
  onClose?: () => void;
  onAuthSuccess?: () => void;
}

export default function LoginModal({ onClose, onAuthSuccess }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const router = useRouter();
  const { getRequestIntent, clearRequestIntent } = useRequestIntent();
  
  // Component mounted
  React.useEffect(() => {
    // Component is ready
  }, []);

  // Debug function removed for security
  
  // Use the new OTP service and hooks
  const { state: otpState, updateState: updateOTPState, resetOTPState } = useOTPState();
  const { otpTimer, otpResendTimer, startTimers, resetTimers } = useOTPTimers();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError("");
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOTPState({ otp: e.target.value, otpError: "" });
  };

  const handleCaptchaVerify = (token: string) => {
    console.log('✅ CAPTCHA verified, token received')
    setCaptchaToken(token);
    setCaptchaError("");
    // Automatically send OTP after CAPTCHA verification
    sendOTPWithCaptcha(token);
  };

  const handleCaptchaError = (error: string) => {
    console.log('❌ CAPTCHA error:', error)
    setCaptchaError(error);
    setCaptchaToken("");
    setIsProcessing(false);
  };

  const sendOTPWithCaptcha = async (token: string) => {
    setIsProcessing(true);
    setError("");

    try {
      const result = await otpClientService.sendOTP(phoneNumber, token);

      if (result.success) {
        updateOTPState({ otpSent: true });
        startTimers();
        setShowCaptcha(false);
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    }

    setIsProcessing(false);
  };

  const handlePhoneNumberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // For minimal implementation, always show CAPTCHA
    // In production, you'd check risk factors here
    setShowCaptcha(true);
    setIsProcessing(true);
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    updateOTPState({ otpProcessing: true, otpError: "" });

    try {
      const result = await otpClientService.verifyOTP(phoneNumber, otpState.otp);

      if (result.success) {
        // Session is already set by the client-side Supabase client
        // No need to manually set it
        
        updateOTPState({ isOTPVerified: true, otpProcessing: false });
        
        // Handle referral if user came through a referral link
        try {
          await createUserWithReferral();
        } catch (referralError) {
          console.error('Error handling referral:', referralError);
          // Don't fail the auth flow if referral fails
        }
        
        // Trigger auth success callback to refresh user data
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        
        // Check for stored request intent and redirect if needed
        const intent = getRequestIntent();
        if (intent) {
          // Clear the intent first
          clearRequestIntent();
          // Redirect to the intended page
          setTimeout(() => {
            router.push(intent.path);
            if (onClose) onClose();
          }, 1000);
        } else {
          // Close modal - no page reload needed
          setTimeout(() => {
            if (onClose) onClose();
          }, 1000);
        }
      } else if (result.error?.includes('Invalid OTP') || result.error?.includes('Invalid token')) {
        // Handle specific OTP errors
        updateOTPState({ 
          otpError: "Invalid verification code. Please check and try again.",
          otpProcessing: false 
        });
      } else {
        updateOTPState({ 
          otpError: result.error || "Verification failed",
          otpProcessing: false 
        });
      }
    } catch (error) {
      updateOTPState({ 
        otpError: "An unexpected error occurred. Please try again.",
        otpProcessing: false 
      });
    }
  };

  const handleResendOTP = async () => {
    if (otpResendTimer > 0) return;
    
    updateOTPState({ otpResendError: "" });
    
    const result = await otpClientService.resendOTP(phoneNumber);

    if (result.success) {
      startTimers();
    } else {
      updateOTPState({ otpResendError: result.error || "Failed to resend code" });
    }
  };

  const handleBackToPhone = () => {
    updateOTPState({ otpSent: false, otp: "", otpError: "", otpProcessing: false });
    resetTimers();
  };

  const handleClearStuckState = () => {
    updateOTPState({ 
      otpProcessing: false, 
      otpError: "Verification was cancelled. Please try again with a fresh code." 
    });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign in
        </h2>
        <p className="text-gray-600">
          Please authenticate to continue
        </p>
      </div>
      
      {otpState.isOTPVerified ? (
        <SuccessMessage />
      ) : !otpState.otpSent ? (
        <>
          {showCaptcha ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Please complete the security check below to send your verification code
                </p>
                <TurnstileCaptcha
                  key={`turnstile-captcha-${showCaptcha ? 'active' : 'inactive'}`}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  className="flex justify-center"
                />
                {captchaError && (
                  <p className="mt-2 text-sm text-red-600">{captchaError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Click the checkbox above to verify you're human
                </p>
              </div>
              <button
                onClick={() => setShowCaptcha(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Back to phone number
              </button>
            </div>
          ) : (
            <PhoneInput
              phoneNumber={phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
              onSubmit={handlePhoneNumberSubmit}
              isProcessing={isProcessing}
              error={error}
            />
          )}
        </>
      ) : (
        <>
          <CodeInput
            phoneNumber={phoneNumber}
            otp={otpState.otp}
            onOTPChange={handleOTPChange}
            onSubmit={handleOTPSubmit}
            onResend={handleResendOTP}
            onBackToPhone={handleBackToPhone}
            isProcessing={otpState.otpProcessing}
            error={otpState.otpError}
            otpTimer={otpTimer}
            otpResendTimer={otpResendTimer}
            resendError={otpState.otpResendError}
          />
          
          {/* Debug buttons removed for security */}
        </>
      )}
      
      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Continue browsing without signing in
        </button>
      </div>
    </div>
  );
} 