"use client";

import React from 'react';
import { SubscriptionData } from "../../../lib/types/billing";

interface BillingActionsProps {
  subscriptionData: SubscriptionData | null;
  cancelling: boolean;
  onManagePayment: () => void;
  onCancelSubscription: () => void;
}

const BillingActions = React.memo(({ 
  subscriptionData, 
  cancelling, 
  onManagePayment, 
  onCancelSubscription 
}: BillingActionsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Actions</h2>
      
      <div className="space-y-3">
        <button
          onClick={onManagePayment}
          className="w-full flex items-center justify-between p-4 border border-[var(--color-neutral-200)] rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Payment Method</p>
              <p className="text-sm text-gray-600">Update your payment details</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {subscriptionData?.status === 'active' && !subscriptionData?.cancelAtPeriodEnd && (
          <button
            onClick={onCancelSubscription}
            disabled={cancelling}
            className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-red-900">Cancel Subscription</p>
                <p className="text-sm text-red-600">
                  {cancelling ? 'Cancelling...' : 'Cancel your subscription at the end of the current period'}
                </p>
              </div>
            </div>
            {!cancelling && (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        )}

        {subscriptionData?.cancelAtPeriodEnd && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-yellow-900">Subscription Cancelling</p>
                <p className="text-sm text-yellow-700">
                  Your subscription will be cancelled at the end of the current billing period
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

BillingActions.displayName = 'BillingActions';
export default BillingActions; 