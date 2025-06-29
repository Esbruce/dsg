import React from "react";

export default function Header() {
  return (
    <div className="text-center flex flex-col items-center p-2">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight text-center">
          Medical Discharge Summary Generator
        </h1>
      </div>
      <p className="text-xl text-gray-600 max-w-3xl p-4 leading-relaxed font-medium text-center">
        Built by Doctors. Powered by AI.
      </p>
    </div>
  );
} 