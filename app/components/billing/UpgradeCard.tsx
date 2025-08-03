"use client";

import { useReferralDiscount } from '@/lib/hooks/useReferralDiscount';

interface UpgradeCardProps {
  onUpgrade: () => void;
}

export default function UpgradeCard({ onUpgrade }: UpgradeCardProps) {
  const { hasDiscount, discountPercentage, isLoading } = useReferralDiscount();
  
  const originalPrice = 2.50; // £2.50
  const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercentage / 100) : originalPrice;
  const savings = originalPrice - discountedPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Pro</h2>
        <p className="text-gray-600">Get unlimited access to all features</p>
      </div>

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          {discountPercentage}% Referral Discount Applied!
        </div>
      )}

      {/* Pricing Display */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
        {hasDiscount ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-gray-900">£{discountedPrice.toFixed(2)}</span>
              <span className="text-lg text-gray-500 line-through">£{originalPrice.toFixed(2)}</span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              You save £{savings.toFixed(2)}/month!
            </div>
            <div className="text-xs text-gray-600">per month</div>
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold text-gray-900">£{originalPrice.toFixed(2)}</div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-gray-700">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Unlimited medical note summaries
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Auto 50% off when you refer a paying friend
        </div>
      </div>

      <button 
        onClick={onUpgrade}
        disabled={isLoading}
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Upgrade Now'}
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Cancel anytime
      </p>
    </div>
  );
} 