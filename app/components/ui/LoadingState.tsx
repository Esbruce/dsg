import React from "react";

export default function LoadingState() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div 
            className="inline-block w-16 h-16 border-4 rounded-full animate-spin" 
            style={{ 
              borderColor: 'var(--color-neutral-200)',
              borderTopColor: 'var(--color-primary)',
              backgroundColor: 'transparent'
            }}
          >
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-neutral-800)' }}>
          Processing your medical notes
        </h2>
        
        <p className="mb-8" style={{ color: 'var(--color-neutral-600)' }}>
          This usually takes 5-20 seconds
        </p>
        
        <div className="space-y-3 text-sm" style={{ color: 'var(--color-neutral-500)' }}>
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ 
                backgroundColor: 'var(--color-primary)'
              }}
            >
            </div>
            <span>Analyzing medical notes</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ 
                backgroundColor: 'var(--color-primary)',
                animationDelay: '0.2s'
              }}
            >
            </div>
            <span>Generating summary</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ 
                backgroundColor: 'var(--color-primary)',
                animationDelay: '0.4s'
              }}
            >
            </div>
            <span>Creating discharge plan</span>
          </div>
        </div>
      </div>
    </div>
  );
} 

