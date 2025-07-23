"use client";

import React from 'react';
import { SubscriptionData } from "../../../lib/types/billing";

interface SubscriptionStatusProps {
  subscriptionData: SubscriptionData | null;
  loadingSubscription: boolean;
}

const SubscriptionStatus = React.memo(({ 
  subscriptionData, 
  loadingSubscription 
}: SubscriptionStatusProps) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          subscriptionData?.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {subscriptionData?.cancelAtPeriodEnd ? 'Cancelling' : 'Pro Plan'}
        </div>
      </div>

      {loadingSubscription ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      ) : subscriptionData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(subscriptionData.price || 299, subscriptionData.currency || 'gbp')}
              </div>
              <div className="text-sm text-gray-600">per {subscriptionData.interval || 'month'}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">
                {subscriptionData.cancelAtPeriodEnd ? 'Cancels on' : 'Next billing date'}
              </div>
              <div className="font-medium text-gray-900">
                {subscriptionData.currentPeriodEnd ? formatDate(subscriptionData.currentPeriodEnd) : 'N/A'}
              </div>
            </div>
          </div>

          {subscriptionData.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800 font-medium">
                  Your subscription will cancel on {subscriptionData.currentPeriodEnd ? formatDate(subscriptionData.currentPeriodEnd) : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">Unable to load subscription details</p>
        </div>
      )}
    </div>
  );
});

SubscriptionStatus.displayName = 'SubscriptionStatus';
export default SubscriptionStatus; 