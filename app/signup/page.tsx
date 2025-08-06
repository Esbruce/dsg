"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { processReferralUUIDFromURL, cleanupReferralURL } from '@/lib/auth/referral-utils';
import { otpClientService, useOTPState, useOTPTimers } from '@/lib/auth/otp-client';
import { createUserWithReferral } from '@/lib/auth/referral-client';
import { clientAuthService } from '@/lib/auth/client-auth-service';
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone';
import PhoneInput from '@/app/components/auth/PhoneInput';
import CodeInput from '@/app/components/auth/CodeInput';
import SuccessMessage from '@/app/components/auth/SuccessMessage';
import TurnstileCaptcha from '@/app/components/auth/TurnstileCaptcha';

function SignupPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [referralUUID, setReferralUUID] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  // Use the OTP service and hooks
  const { state: otpState, updateState: updateOTPState, resetOTPState } = useOTPState();
  const { otpTimer, otpResendTimer, startTimers, resetTimers } = useOTPTimers();

  useEffect(() => {
    // Process referral UUID from URL and store it
    processReferralUUIDFromURL();
    
    // Get the referral UUID for display/confirmation
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralUUID(refParam);
    }
  }, [searchParams]);

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
      // Validate phone number first before any processing
      const phoneValidation = validateUKPhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        setError(phoneValidation.error || "Invalid phone number");
        setIsProcessing(false);
        return;
      }

      // Handle development bypass
      if (token === 'dev-bypass') {
        console.log('🔧 Development mode: Using bypass token');
        
        // Use the new signup OTP method (doesn't create user yet)
        const result = await clientAuthService.sendSignupOTP(phoneNumber);

        if (result.success) {
          updateOTPState({ otpSent: true });
          startTimers();
          setShowCaptcha(false);
        } else {
          setError(result.error || "Failed to send OTP");
        }
        setIsProcessing(false);
        return;
      }

      // For signup, use the new signup OTP method (doesn't create user yet)
      const result = await clientAuthService.sendSignupOTP(phoneNumber);

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
    
    // For development, allow bypassing CAPTCHA
    if (process.env.NODE_ENV === 'development' && !phoneNumber.includes('test')) {
      // Bypass CAPTCHA for development (except when testing)
      console.log('🔧 Development mode: Bypassing CAPTCHA');
      sendOTPWithCaptcha('dev-bypass');
      return;
    }
    
    // For signup, always show CAPTCHA
    setShowCaptcha(true);
    setIsProcessing(true);
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    updateOTPState({ otpProcessing: true, otpError: "" });

    try {
      // Verify OTP first
      const result = await otpClientService.verifyOTP(phoneNumber, otpState.otp);

      if (result.success) {
        // OTP verification successful - now create the user record
        console.log('✅ OTP verified successfully, creating user record...');
        
        updateOTPState({ isOTPVerified: true, otpProcessing: false });
        
        // Handle referral and create user record
        try {
          const userCreationResult = await createUserWithReferral();
          
          if (userCreationResult.success) {
            console.log('✅ User record created successfully');
            // Clean up referral URL after successful signup
            cleanupReferralURL();
          } else {
            console.error('❌ Failed to create user record:', userCreationResult.error);
            // Don't fail the auth flow if user record creation fails
            // The user is still authenticated, just missing the record
          }
        } catch (referralError) {
          console.error('Error handling referral/user creation:', referralError);
          // Don't fail the auth flow if referral fails
        }
        
        // Redirect to main app after successful signup
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else if (result.error?.includes('Invalid OTP') || result.error?.includes('Invalid token')) {
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
      console.error('❌ OTP verification error:', error);
      updateOTPState({ 
        otpError: "An unexpected error occurred. Please try again.",
        otpProcessing: false 
      });
    }
  };

  const handleResendOTP = async () => {
    if (otpResendTimer > 0) return;
    
    updateOTPState({ otpResendError: "" });
    
    try {
      // For resend, use the new signup OTP method (doesn't create user yet)
      const result = await clientAuthService.sendSignupOTP(phoneNumber);

      if (result.success) {
        startTimers();
      } else {
        updateOTPState({ otpResendError: result.error || "Failed to resend code" });
      }
    } catch (error) {
      updateOTPState({ otpResendError: "Failed to resend code" });
    }
  };

  const handleBackToPhone = () => {
    updateOTPState({ otpSent: false, otp: "", otpError: "", otpProcessing: false });
    resetTimers();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to DSG
            </h2>
            <p className="text-gray-600 mt-2">
              Create your account to get started
            </p>
            {referralUUID && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  🎉 You were invited by a friend! 
                </p>
              </div>
            )}
          </div>
          
          {otpState.isOTPVerified ? (
            <div className="text-center">
              <SuccessMessage />
              <p className="text-sm text-gray-600 mt-4">
                Redirecting you to the app...
              </p>
            </div>
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
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/')}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
} 