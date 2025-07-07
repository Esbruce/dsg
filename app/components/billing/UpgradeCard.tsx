"use client";

interface UpgradeCardProps {
  onUpgrade: () => void;
}

export default function UpgradeCard({ onUpgrade }: UpgradeCardProps) {
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

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
        <div className="text-3xl font-bold text-gray-900">£2.99</div>
        <div className="text-sm text-gray-600">per month</div>
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
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Upgrade Now
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Cancel anytime
      </p>
    </div>
  );
} 