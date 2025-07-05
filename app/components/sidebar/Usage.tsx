import React from "react";

type UsageProps = {
  usageCount: number;
  maxUsage: number;
  isPaid: boolean;
};

export default function Usage({ usageCount, maxUsage, isPaid }: UsageProps) {
  return (
    <div className={`rounded-xl p-4 border ${isPaid 
      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' 
      : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          {isPaid ? 'Pro Usage' : 'Daily Usage'}
        </h3>
        <div className="flex items-center gap-1">
          <svg className={`w-4 h-4 ${isPaid ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isPaid ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            )}
          </svg>
        </div>
      </div>
      
      {isPaid ? (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-700">∞</span>
          <span className="text-sm text-green-600 font-medium">Unlimited</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{maxUsage - usageCount}</span>
            <span className="text-sm text-gray-600">summaries left</span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((maxUsage - usageCount) / maxUsage) * 100}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
} 