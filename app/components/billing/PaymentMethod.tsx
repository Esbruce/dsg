"use client";

import React from 'react';
import { SubscriptionData } from "../../../lib/types/billing";

interface PaymentMethodProps {
  subscriptionData: SubscriptionData | null;
  loadingSubscription: boolean;
}

const PaymentMethod = React.memo(({ subscriptionData, loadingSubscription }: PaymentMethodProps) => {
  return (
    <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
      </div>

      {loadingSubscription ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading payment method...</p>
        </div>
      ) : subscriptionData?.paymentMethod ? (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              •••• •••• •••• {subscriptionData.paymentMethod.last4}
            </p>
            <p className="text-sm text-gray-600">
              Expires {subscriptionData.paymentMethod.exp_month}/{subscriptionData.paymentMethod.exp_year}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-600">No payment method on file</p>
        </div>
      )}
    </div>
  );
});

PaymentMethod.displayName = 'PaymentMethod';
export default PaymentMethod; 