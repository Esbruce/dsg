"use client";

import React, { useState } from 'react';
import { validateUKPhoneNumber, normalizeUKPhoneNumber } from '@/lib/utils/phone';

export default function PhoneTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);

  const testPhoneNumber = () => {
    const validation = validateUKPhoneNumber(phoneNumber);
    const normalized = normalizeUKPhoneNumber(phoneNumber);
    
    setValidationResult({
      phoneNumber,
      validation,
      normalized,
      timestamp: new Date().toISOString()
    });
  };

  const testCases = [
    "07849 484659", // Valid mobile
    "020 7946 0958", // Valid landline
    "07849 48465", // Invalid (missing digit)
    "123", // Invalid
    "07849 4846599", // Invalid (too long)
    "07849 48465a", // Invalid (contains letter)
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Phone Number Validation Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Phone Number</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
            <button
              onClick={testPhoneNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test
            </button>
          </div>
          
          {validationResult && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm">{JSON.stringify(validationResult, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="flex items-center gap-4 p-2 border rounded">
                <span className="font-mono">{testCase}</span>
                <button
                  onClick={() => {
                    setPhoneNumber(testCase);
                    setTimeout(testPhoneNumber, 100);
                  }}
                  className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                >
                  Test
                </button>
                <span className={`text-sm ${validateUKPhoneNumber(testCase).valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validateUKPhoneNumber(testCase).valid ? '✅ Valid' : '❌ Invalid'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 