"use client";

import React from 'react';
import { SubscriptionData } from "../../../lib/types/billing";
import { useReferralDiscount } from "@/lib/hooks/useReferralDiscount";

interface SubscriptionStatusProps {
  subscriptionData: SubscriptionData | null;
  loadingSubscription: boolean;
}

const SubscriptionStatus = React.memo(({ 
  subscriptionData, 
  loadingSubscription 
}: SubscriptionStatusProps) => {
  const { hasDiscount, discountPercentage, isLoading: discountLoading } = useReferralDiscount();

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

  // Calculate the correct price to display
  const getDisplayPrice = () => {
    if (!subscriptionData) return null;
    
    const originalPrice = subscriptionData.price || 299; // £2.99 in cents
    const originalPriceGBP = originalPrice / 100; // Convert to pounds
    
    if (hasDiscount && discountPercentage > 0) {
      const discountedPrice = originalPriceGBP * (1 - discountPercentage / 100);
      return {
        displayPrice: discountedPrice,
        originalPrice: originalPriceGBP,
        hasDiscount: true,
        discountPercentage
      };
    }
    
    return {
      displayPrice: originalPriceGBP,
      originalPrice: originalPriceGBP,
      hasDiscount: false,
      discountPercentage: 0
    };
  };

  const priceInfo = getDisplayPrice();

  return (
    <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
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

      {loadingSubscription || discountLoading ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      ) : subscriptionData && priceInfo ? (
        <>
          {/* Discount Badge */}
          {priceInfo.hasDiscount && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              {priceInfo.discountPercentage}% Referral Discount Applied!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {priceInfo.hasDiscount ? (
                  <div className="flex items-center gap-2">
                    <span>£{priceInfo.displayPrice.toFixed(2)}</span>
                    <span className="text-lg text-gray-500 line-through">£{priceInfo.originalPrice.toFixed(2)}</span>
                  </div>
                ) : (
                  <span>£{priceInfo.displayPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="text-sm text-gray-600">per {subscriptionData.interval || 'month'}</div>
              {priceInfo.hasDiscount && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  Save £{(priceInfo.originalPrice - priceInfo.displayPrice).toFixed(2)}/month!
                </div>
              )}
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