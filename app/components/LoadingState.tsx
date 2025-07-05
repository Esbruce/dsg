import React from "react";

export default function LoadingState() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="text-xl font-semibold text-gray-900">
            AI is processing your notes...
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-gray-600">Analyzing medical notes...</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-gray-600">Generating summary...</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-gray-600">Creating discharge plan...</span>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Processing Time</span>
        </div>
        <p className="text-sm text-gray-600">
          This usually takes 30-60 seconds. Please wait while our AI analyzes your medical notes.
        </p>
      </div>
    </div>
  );
} 