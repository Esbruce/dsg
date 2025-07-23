'use client'

import React from 'react';

export default function SuccessMessage() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
      <p className="text-gray-600">You've been successfully authenticated!</p>
      <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
    </div>
  );
} 