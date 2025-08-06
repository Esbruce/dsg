import React from "react";
import { useRouter } from "next/navigation";
import { useLoginModal } from "../../auth/LoginModal";
import { useReferralDiscount } from "@/lib/hooks/useReferralDiscount";

type PlanProps = {
  isPaid: boolean;
  onGoUnlimited: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
};

export default function Plan({ isPaid, onGoUnlimited, isAuthenticated, isLoading = false }: PlanProps) {
  const router = useRouter();
  const { showInlineLoginModal } = useLoginModal();
  
  // Only fetch referral discount data if user is authenticated
  const referralDiscount = useReferralDiscount();
  const { hasDiscount, discountPercentage, isLoading: discountLoading } = isAuthenticated ? referralDiscount : { hasDiscount: false, discountPercentage: 0, isLoading: false };

  if (isPaid) {
    return (
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl p-4 text-white shadow-symmetric">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 bg-white/20 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-bold">Unlimited Member</h3>
        </div>
        <p className="text-sm text-green-100 mb-3">
          You have unlimited access to all features
        </p>
        <button 
          onClick={() => isAuthenticated && !isLoading ? router.push('/billing') : showInlineLoginModal()}
          disabled={isLoading}
          className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
        >
          {isLoading ? 'Loading...' : 'Manage Billing'}
        </button>
      </div>
    );
  }

  const originalPrice = 2.50; // £2.50
  const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercentage / 100) : originalPrice;
  const savings = originalPrice - discountedPrice;

  return (
    <div className="bg-[var(--color-primary)] rounded-xl p-5 text-white shadow-symmetric">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-white/20 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg">Upgrade to Unlimited</h3>
      </div>
      
      {/* Discount Badge - Only show for authenticated users with discount */}
      {isAuthenticated && hasDiscount && (
        <div className="mb-3 inline-flex items-center gap-2 px-2 py-1 bg-green-500/20 text-green-100 rounded-full text-xs font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          {discountPercentage}% Referral Discount!
        </div>
      )}
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-teal-100">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Unlimited usage
        </div>
        <div className="flex items-center gap-2 text-sm text-teal-100">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Auto 50% off if you invite a paying friend
        </div>
      </div>

      {/* Pricing Display */}
      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <div className="text-center">
          {isAuthenticated && discountLoading ? (
            <div className="space-y-1">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-xs text-teal-200">Loading pricing...</div>
            </div>
          ) : isAuthenticated && hasDiscount ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">£{discountedPrice.toFixed(2)}</span>
                <span className="text-sm line-through opacity-70">£{originalPrice.toFixed(2)}</span>
              </div>
              <div className="text-xs text-green-200 font-medium">
                Save £{savings.toFixed(2)}/month!
              </div>
              <div className="text-xs text-teal-200">per month</div>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold">£{originalPrice.toFixed(2)}</div>
              <div className="text-xs text-teal-200">per month</div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => isAuthenticated ? onGoUnlimited() : showInlineLoginModal()}
        disabled={isAuthenticated && discountLoading}
        className="w-full bg-white text-[var(--color-primary)] font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md disabled:opacity-50"
      >
        {isAuthenticated && discountLoading ? 'Loading...' : 'Upgrade Now'}
      </button>
      
      <p className="text-xs text-teal-200 text-center mt-2">
        Cancel anytime 
      </p>
    </div>
  );
} 