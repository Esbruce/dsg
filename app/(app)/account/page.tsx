"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserData } from "../../../lib/hooks/useUserData";

// Types
import { SubscriptionData } from "../../../lib/types/billing";

// Components
import AccountOverview from "../../components/account/AccountOverview";
import AccountQuickActions from "../../components/account/AccountQuickActions";
import SectionHeader from "../../components/account/SectionHeader";
import BillingSkeleton from "../../components/billing/BillingSkeleton";
import ErrorState from "../../components/billing/ErrorState";
import UpgradeCard from "../../components/billing/UpgradeCard";
import SubscriptionStatus from "../../components/billing/SubscriptionStatus";
import PaymentMethod from "../../components/billing/PaymentMethod";
import BillingActions from "../../components/billing/BillingActions";
import ReferralDashboard from "../../components/billing/ReferralDashboard";

export default function AccountPage() {
  // Local state (subscription data only)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Context data
  const { isPaid, isLoading, isAuthenticated, userIdentifier, refreshUserData, refreshAll } = useUserData();

  // Hooks
  const router = useRouter();

  // Effects
  useEffect(() => {
    // With server-side middleware redirecting unauthenticated users to /login,
    // this client-side redirect is no longer necessary. Keep a no-op for safety.
  }, [isLoading, isAuthenticated, router]);

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
      console.log('Starting checkout process...');
      
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      console.log('Checkout response status:', checkoutRes.status);

      if (!checkoutRes.ok) {
        const errorData = await checkoutRes.json().catch(() => ({}));
        console.error('Checkout failed:', { status: checkoutRes.status, error: errorData });
        throw new Error(`Checkout failed: ${checkoutRes.status} ${checkoutRes.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }

      const checkoutData = await checkoutRes.json();
      console.log('Checkout data received:', checkoutData);
      
      if (checkoutData.url) {
        console.log('Redirecting to checkout URL:', checkoutData.url);
        window.location.href = checkoutData.url;
      } else {
        console.error('No checkout URL in response:', checkoutData);
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert("Error redirecting to checkout: " + errorMessage);
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl text-[var(--color-neutral-800)] font-bold">Account Settings</h1>
        </div>

        {/* Account Info */}
        <SectionHeader title="User" />
        <div className="flex flex-col gap-4 mb-8">
          <AccountOverview isLoading={isLoading} userIdentifier={userIdentifier} isPaid={isPaid} />
        </div>

        {/* Billing & Subscription */}
        <SectionHeader title="Billing & Subscription" className="mb-6" />
        {isLoading ? (
          <BillingSkeleton />
        ) : !isPaid ? (
          <div className="space-y-6">
            <UpgradeCard onUpgrade={handleUpgrade} />
          </div>
        ) : (
          <div className="space-y-6">
            <SubscriptionStatus 
              subscriptionData={subscriptionData}
              loadingSubscription={loadingSubscription}
            />

            <PaymentMethod 
              subscriptionData={subscriptionData} 
              loadingSubscription={loadingSubscription}
            />

            <BillingActions
              subscriptionData={subscriptionData}
              cancelling={cancelling}
              onManagePayment={handleManagePayment}
              onCancelSubscription={handleCancelSubscription}
            />
          </div>
        )}

        {/* Invite Friends */}
        <div className="mt-10">
          <SectionHeader title="Invite Friends" description="Share DSG with colleagues and unlock discounts." />
          <ReferralDashboard />
        </div>
      </div>
    </div>
  );
} 