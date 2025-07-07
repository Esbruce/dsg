"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserData } from "../layout";

// Types
import { UserStatus, SubscriptionData } from "./types";

// Components
import BillingHeader from "../../components/billing/BillingHeader";
import BillingSkeleton, { BillingContentSkeleton } from "../../components/billing/BillingSkeleton";
import ErrorState from "../../components/billing/ErrorState";
import UpgradeCard from "../../components/billing/UpgradeCard";
import SubscriptionStatus from "../../components/billing/SubscriptionStatus";
import PaymentMethod from "../../components/billing/PaymentMethod";
import BillingActions from "../../components/billing/BillingActions";

export default function BillingPage() {
  // State
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Hooks
  const router = useRouter();
  const { refreshUserData } = useUserData();

  // Effects
  useEffect(() => {
    fetchUserStatus();
  }, []);

  // Data fetching functions
  const fetchUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();
      setUserStatus(data.user);

      // Only fetch subscription details if user is paid
      if (data.user.is_paid) {
        await fetchSubscriptionDetails();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        body: JSON.stringify({ cancel_immediately: false }),  // Only non-sensitive data
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh both user status and subscription data
      await fetchUserStatus();
      refreshUserData(); // Update sidebar and header
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

        {loading ? (
          <BillingContentSkeleton />
        ) : !userStatus?.is_paid ? (
          <UpgradeCard onUpgrade={handleUpgrade} />
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
          </div>
        )}
      </div>
    </div>
  );
} 