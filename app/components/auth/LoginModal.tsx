'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import PhoneInput from './PhoneInput';
import CodeInput from './CodeInput';
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
  const [captchaError, setCaptchaError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const router = useRouter();
  const { getRequestIntent, clearRequestIntent } = useRequestIntent();
  
  const { state: otpState, updateState: updateOTPState } = useOTPState();
  const { otpTimer, otpResendTimer, startTimers, resetTimers } = useOTPTimers();

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError("");
    setIsRateLimited(false);
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOTPState({ otp: e.target.value, otpError: "" });
  };

  const sendOTPWithCaptcha = useCallback(async (token: string) => {
    setError("");
    try {
      const result = await otpClientService.sendOTP(phoneNumber, token);
      if (!isMountedRef.current) return;

      if (result.success) {
        updateOTPState({ otpSent: true });
        startTimers();
        setShowCaptcha(false);
        setIsProcessing(false);
        setIsRateLimited(false);
      } else {
        if (result.rateLimited) {
          setError(`Rate limited: ${result.error}`);
          setIsRateLimited(true);
          setIsProcessing(false);
        } else {
          setError(result.error || "Failed to send OTP");
          setShowCaptcha(false);
          setIsProcessing(false);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError("An unexpected error occurred.");
        setShowCaptcha(false);
        setIsProcessing(false);
      }
    }
  }, [phoneNumber, updateOTPState, startTimers]);

  const handleCaptchaError = useCallback((error: string) => {
    console.error('❌ LoginModal: CAPTCHA error received:', error);
    setCaptchaError(error);
    if (isMountedRef.current) {
      setIsProcessing(false);
    }
  }, []);

  const handleCaptchaVerify = useCallback((token: string) => {
    console.log('✅ LoginModal: CAPTCHA verified, proceeding to send OTP');
    setCaptchaError("");
    sendOTPWithCaptcha(token);
  }, [sendOTPWithCaptcha]);
  
  const handlePhoneNumberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");
    setIsProcessing(true);
    setShowCaptcha(true);
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateOTPState({ otpProcessing: true, otpError: "" });
    try {
      const result = await otpClientService.verifyOTP(phoneNumber, otpState.otp);
      if (!isMountedRef.current) return;
      
      if (result.success) {
        // Do not show an intermediate success view; proceed to redirect immediately
        updateOTPState({ otpProcessing: false });

        // Kick off referral/user creation in the background so we don't block navigation
        createUserWithReferral().catch((referralError) => {
          console.error('Error handling referral:', referralError);
        });
        
        // If parent provided a handler, delegate post-auth navigation to it
        if (onAuthSuccess) {
          // Delegate post-auth navigation to parent (do not clear intent here)
          onAuthSuccess();
        } else {
          // Default behavior: respect stored intent for navigation
          const intent = getRequestIntent();
          const currentPath = window.location.pathname;
          const targetPath = (intent && intent.payload.type === 'navigate' && intent.payload.path !== currentPath && intent.payload.path !== '/') ? intent.payload.path : null;

          clearRequestIntent();
          if (targetPath) router.push(targetPath);
          onClose?.();
        }

      } else {
        updateOTPState({ otpError: result.error || "Verification failed", otpProcessing: false });
      }
    } catch (error) {
      if (isMountedRef.current) {
        updateOTPState({ otpError: "An unexpected error occurred.", otpProcessing: false });
      }
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
    setShowCaptcha(false);
    setIsProcessing(false);
    setIsRateLimited(false);
    setError("");
    setCaptchaError("");
  };

  const handleRetry = () => {
    setCaptchaError('');
    setIsProcessing(true);
    setShowCaptcha(false); 
    setTimeout(() => setShowCaptcha(true), 50);
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
        <p className="text-gray-600">Please authenticate to continue</p>
      </div>
      
      {!otpState.otpSent ? (
        <>
          {showCaptcha ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 mb-4">{isProcessing ? "Verifying you're human..." : ""}</p>
              {isRateLimited ? (
                <div className="space-y-2">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Rate Limited</p>
                    <p className="text-xs text-red-500 mt-1">Too many attempts. Please wait before trying again.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setError("");
                      setIsRateLimited(false);
                      setShowCaptcha(false);
                      setIsProcessing(false);
                    }} 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Try with different phone number
                  </button>
                </div>
              ) : (
                <TurnstileCaptcha
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                />
              )}
              {captchaError && !isRateLimited && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-red-600">{captchaError}</p>
                  <button onClick={handleRetry} className="text-sm text-blue-600 hover:underline" disabled={isProcessing}>
                    Try again
                  </button>
                </div>
              )}
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
      )}
      

    </div>
  );
}


