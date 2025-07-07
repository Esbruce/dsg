"use client";

import { SubscriptionData } from "../../(app)/billing/types";

interface BillingActionsProps {
  subscriptionData: SubscriptionData | null;
  cancelling: boolean;
  onManagePayment: () => void;
  onCancelSubscription: () => void;
}

export default function BillingActions({ 
  subscriptionData, 
  cancelling, 
  onManagePayment, 
  onCancelSubscription 
}: BillingActionsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Actions</h2>
      <div className="space-y-4">
        <button
          onClick={onManagePayment}
          className="w-full flex items-center justify-between p-4 border border-[var(--color-neutral-200)] rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="text-left">
              <div className="font-medium text-gray-900">Manage Payment Methods</div>
              <div className="text-sm text-gray-600">Update cards, billing address, and view invoices</div>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!subscriptionData?.cancelAtPeriodEnd && (
          <button
            onClick={onCancelSubscription}
            disabled={cancelling}
            className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="text-left">
                <div className="font-medium text-red-900">Cancel Subscription</div>
                <div className="text-sm text-red-600">Cancel at the end of current billing period</div>
              </div>
            </div>
            {cancelling && (
              <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
            )}
          </button>
        )}
      </div>
    </div>
  );
} 