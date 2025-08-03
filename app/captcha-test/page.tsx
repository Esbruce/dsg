"use client";

import React, { useState } from 'react';
import TurnstileCaptcha from '@/app/components/auth/TurnstileCaptcha';

export default function CaptchaTestPage() {
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string>('');
  const [siteKey, setSiteKey] = useState<string>('');

  const handleCaptchaVerify = (token: string) => {
    console.log('✅ CAPTCHA verified, token received:', token.substring(0, 20) + '...');
    setCaptchaToken(token);
    setCaptchaError('');
  };

  const handleCaptchaError = (error: string) => {
    console.log('❌ CAPTCHA error:', error);
    setCaptchaError(error);
    setCaptchaToken('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              CAPTCHA Test Page
            </h2>
            <p className="text-gray-600 mt-2">
              Test your CAPTCHA configuration
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Key (from environment)
              </label>
              <input
                type="text"
                value={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || 'NOT SET'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Site Key (for testing)
              </label>
              <input
                type="text"
                value={siteKey}
                onChange={(e) => setSiteKey(e.target.value)}
                placeholder="Enter your Turnstile site key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                CAPTCHA Widget
              </h3>
              <TurnstileCaptcha
                siteKey={siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                className="flex justify-center"
              />
            </div>

            {captchaToken && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ CAPTCHA Verified!</h4>
                <p className="text-sm text-green-600">
                  Token: {captchaToken.substring(0, 20)}...
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Token length: {captchaToken.length} characters
                </p>
              </div>
            )}

            {captchaError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">❌ CAPTCHA Error</h4>
                <p className="text-sm text-red-600">{captchaError}</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Environment Variables</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p>NEXT_PUBLIC_TURNSTILE_SITE_KEY: {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? 'SET' : 'NOT SET'}</p>
                <p>NEXT_PUBLIC_BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 