import React from "react";

type ProcessButtonProps = {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
};

export default function ProcessButton({ onClick, disabled, loading }: ProcessButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-100 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${!loading ? 'animate-pulse' : ''}`}
      style={!disabled ? { background: 'rgba(4,179,190,1)' } : { background: '#b2e4e6' }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgba(4,179,190,1)">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="rgba(4,179,190,1)" strokeWidth="4"></circle>
            <path className="opacity-75" fill="rgba(4,179,190,1)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xl italic">Create Summary</span>
        </div>
      )}
    </button>
  );
} 