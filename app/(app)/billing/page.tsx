"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "../layout";

// Types
import { SubscriptionData } from "../../../lib/types/billing";

// Components
import BillingHeader from "../../components/billing/BillingHeader";
import { BillingContentSkeleton } from "../../components/billing/BillingSkeleton";
import ErrorState from "../../components/billing/ErrorState";
import UpgradeCard from "../../components/billing/UpgradeCard";
import SubscriptionStatus from "../../components/billing/SubscriptionStatus";
import PaymentMethod from "../../components/billing/PaymentMethod";
import BillingActions from "../../components/billing/BillingActions";
import ReferralDashboard from "../../components/billing/ReferralDashboard";

export default function BillingPage() {
  // Local state (subscription data only)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Context data
  const { isPaid, isLoading, refreshUserData, refreshAll } = useUserData();

  // Hooks
  const router = useRouter();

  // Effects
  useEffect(() => {
    // Only fetch subscription details if user is paid and data is loaded
    if (!isLoading && isPaid && !subscriptionData) {
      fetchSubscriptionDetails();
    }
  }, [isPaid, isLoading, subscriptionData]);

  // Data fetching functions
  const fetchSubscriptionDetails = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription details');
      }

      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      // Don't set error here as basic functionality should still work
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Action handlers
  const handleUpgrade = async () => {
    try {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (!checkoutRes.ok) {
        throw new Error(`Checkout failed: ${checkoutRes.status} ${checkoutRes.statusText}`);
      }

      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      alert("Error redirecting to checkout: " + (err as Error).message);
    }
  };

  const handleManagePayment = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      alert('Error opening billing portal: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ cancel_immediately: false }),  // Only non-sensitive data
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh all data and fetch updated subscription details
      await refreshAll();
      await fetchSubscriptionDetails();
      alert('Your subscription has been scheduled for cancellation at the end of your current billing period.');
    } catch (err) {
      alert('Error cancelling subscription: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setCancelling(false);
    }
  };

  // Render states
  if (error) {
    return <ErrorState error={error} />;
  }

  // Main render
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <BillingHeader />

        {isLoading ? (
          <BillingContentSkeleton />
        ) : !isPaid ? (
          <div className="space-y-6">
            <UpgradeCard onUpgrade={handleUpgrade} />
            <ReferralDashboard />
          </div>
        ) : (
          <div className="space-y-6">
            <SubscriptionStatus 
              subscriptionData={subscriptionData}
              loadingSubscription={loadingSubscription}
            />

            <PaymentMethod subscriptionData={subscriptionData} />

            <BillingActions
              subscriptionData={subscriptionData}
              cancelling={cancelling}
              onManagePayment={handleManagePayment}
              onCancelSubscription={handleCancelSubscription}
            />

            <ReferralDashboard />
          </div>
        )}
      </div>
    </div>
  );
} 