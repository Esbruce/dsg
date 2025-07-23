import React from "react";
import { useRouter } from "next/navigation";
import { useLoginModal } from "../../auth/LoginModal";

type PlanProps = {
  isPaid: boolean;
  onGoUnlimited: () => void;
  isAuthenticated: boolean;
};

export default function Plan({ isPaid, onGoUnlimited, isAuthenticated }: PlanProps) {
  const router = useRouter();
  const { showInlineLoginModal } = useLoginModal();

  if (isPaid) {
    return (
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 bg-white/20 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-bold">Pro Member</h3>
        </div>
        <p className="text-sm text-green-100 mb-3">
          You have unlimited access to all features
        </p>
        <button 
          onClick={() => isAuthenticated ? router.push('/billing') : showInlineLoginModal()}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
        >
          Manage Billing
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-primary)] rounded-xl p-5 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-white/20 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg">Upgrade to Unlimited</h3>
      </div>
      
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
      <div className="bg-white/10 rounded-lg p-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold">£1.99</div>
          <div className="text-xs text-teal-200">per month</div>
        </div>
      </div>

      <button 
        onClick={() => isAuthenticated ? onGoUnlimited() : showInlineLoginModal()}
        className="w-full bg-white text-[var(--color-primary)] font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md"
      >
        Upgrade Now
      </button>
      
      <p className="text-xs text-teal-200 text-center mt-2">
        Cancel anytime 
      </p>
    </div>
  );
} 