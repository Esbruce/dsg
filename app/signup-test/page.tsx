"use client";

import React, { useState } from 'react';
import { clientAuthService } from '@/lib/auth/client-auth-service';
import { validateUKPhoneNumber } from '@/lib/utils/phone';

export default function SignupTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSendOTP = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing sendSignupOTP with:', phoneNumber);
      const response = await clientAuthService.sendSignupOTP(phoneNumber);
      
      setResult({
        type: 'sendOTP',
        phoneNumber,
        response,
        timestamp: new Date().toISOString()
      });
      
      console.log('🧪 SendSignupOTP result:', response);
    } catch (error) {
      setResult({
        type: 'sendOTP',
        phoneNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      console.error('🧪 SendSignupOTP error:', error);
    }

    setIsLoading(false);
  };

  const testVerifyOTP = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing verifyOTP with:', phoneNumber, otp);
      const response = await clientAuthService.verifyOTP(phoneNumber, otp);
      
      setResult({
        type: 'verifyOTP',
        phoneNumber,
        otp,
        response,
        timestamp: new Date().toISOString()
      });
      
      console.log('🧪 VerifyOTP result:', response);
    } catch (error) {
      setResult({
        type: 'verifyOTP',
        phoneNumber,
        otp,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      console.error('🧪 VerifyOTP error:', error);
    }

    setIsLoading(false);
  };

  const testCases = [
    "07849 484659", // Valid mobile
    "020 7946 0958", // Valid landline
    "07849 48465", // Invalid (missing digit)
    "123", // Invalid
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Signup Flow Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Send OTP</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07849 484659"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Validation: {validateUKPhoneNumber(phoneNumber).valid ? '✅ Valid' : '❌ Invalid'}
              </p>
            </div>
            <button
              onClick={testSendOTP}
              disabled={isLoading || !validateUKPhoneNumber(phoneNumber).valid}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? "Testing..." : "Test Send OTP"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Verify OTP</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP Code:</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                maxLength={6}
              />
            </div>
            <button
              onClick={testVerifyOTP}
              disabled={isLoading || !otp || otp.length !== 6}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? "Testing..." : "Test Verify OTP"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Test Cases</h2>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="flex items-center gap-4 p-2 border rounded">
                <span className="font-mono">{testCase}</span>
                <button
                  onClick={() => {
                    setPhoneNumber(testCase);
                    setTimeout(testSendOTP, 100);
                  }}
                  className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                >
                  Test Send
                </button>
                <span className={`text-sm ${validateUKPhoneNumber(testCase).valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validateUKPhoneNumber(testCase).valid ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 