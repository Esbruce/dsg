'use client'

import React, { createContext, useContext, useState } from 'react'
import PhoneInput from './PhoneInput';
import CodeInput from './CodeInput';
import SuccessMessage from './SuccessMessage';
import { otpClientService, useOTPState, useOTPTimers } from '@/lib/auth/otp-client';

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
  
  // Component mounted
  React.useEffect(() => {
    // Component is ready
  }, []);

  // Debug function to test verification
  const debugVerification = async () => {
    console.log('🔍 Debug: Testing verification with code:', otpState.otp);
    console.log('🔍 Debug: Phone number:', phoneNumber);
    
    // Test with a simple verification
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otpState.otp,
      type: 'sms',
    });
    
    console.log('🔍 Debug: Verification result:', { data, error });
    
    if (error) {
      console.log('❌ Debug: Error details:', error);
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        alert('OTP code expired or invalid. Please request a new code.');
      }
    }
  };
  
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

  const handlePhoneNumberSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsProcessing(true);
    setError("");

    const result = await otpClientService.sendOTP(phoneNumber);

    if (result.success) {
      updateOTPState({ otpSent: true });
      startTimers();
    } else {
      setError(result.error || "Failed to send OTP");
    }

    setIsProcessing(false);
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('🔍 LoginModal: Starting OTP verification for', phoneNumber)
    console.log('🔍 LoginModal: OTP value:', otpState.otp ? '***' : 'missing')
    
    updateOTPState({ otpProcessing: true, otpError: "" });

    try {
      const result = await otpClientService.verifyOTP(phoneNumber, otpState.otp);
      
      console.log('🔍 LoginModal: OTP verification result:', { 
        success: result.success, 
        error: result.error,
        hasSession: !!result.session 
      })

      if (result.success) {
        console.log('✅ LoginModal: OTP verification successful')
        
        // Session is already set by the client-side Supabase client
        // No need to manually set it
        
        updateOTPState({ isOTPVerified: true, otpProcessing: false });
        
        // Trigger auth success callback to refresh user data
        if (onAuthSuccess) {
          console.log('🔍 LoginModal: Triggering auth success callback')
          onAuthSuccess();
        }
        
        // Close modal - no page reload needed
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      } else if (result.error?.includes('Invalid OTP') || result.error?.includes('Invalid token')) {
        // Handle specific OTP errors
        console.log('❌ LoginModal: Invalid OTP code')
        updateOTPState({ 
          otpError: "Invalid verification code. Please check and try again.",
          otpProcessing: false 
        });
      } else {
        console.log('❌ LoginModal: OTP verification failed:', result.error)
        updateOTPState({ 
          otpError: result.error || "Verification failed",
          otpProcessing: false 
        });
      }
    } catch (error) {
      console.log('❌ LoginModal: OTP verification unexpected error:', error)
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
    console.log('🔧 Clearing stuck verification state');
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
        <PhoneInput
          phoneNumber={phoneNumber}
          onPhoneNumberChange={handlePhoneNumberChange}
          onSubmit={handlePhoneNumberSubmit}
          isProcessing={isProcessing}
          error={error}
        />
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
          
          {/* Debug and cancel buttons - remove after testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={debugVerification}
                className="text-sm text-blue-600 hover:text-blue-800 underline block"
              >
                Debug: Test Verification
              </button>
              {otpState.otpProcessing && (
                <button
                  type="button"
                  onClick={handleClearStuckState}
                  className="text-sm text-red-600 hover:text-red-800 underline block"
                >
                  Cancel Verification (if stuck)
                </button>
              )}
            </div>
          )}
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