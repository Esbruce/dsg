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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ cancel_immediately: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await refreshAll();
      await fetchSubscriptionDetails();
      setShowCancelModal(false);
      alert('Your subscription has been scheduled for cancellation at the end of your current billing period.');
    } catch (err) {
      alert('Error cancelling subscription: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }

      setShowDeleteModal(false);
      alert('Your account has been deleted.');
      window.location.href = '/';
    } catch (err) {
      alert('Error deleting account: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeleting(false);
      setConfirmText('');
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
          <SectionHeader title="Invite Friends" description="Invite colleagues. Your 3rd referral grants 6 months unlimited, then 50% off afterward." />
          <ReferralDashboard />
        </div>

        {/* Legal */}
        <div className="mt-10">
          <SectionHeader title="Legal" description="Policies and terms for using DSG." />
          <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
            <p className="text-sm text-[var(--color-neutral-700)]">
              Review our
              {' '}<a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline"
              >
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>

        {/* Account and data removal */}
        <div className="mt-10">
          <SectionHeader title="Account and Data Removal" description="Permanently remove your account, subscription, and associated data." />
          <div className="bg-white rounded-xl shadow-symmetric border border-red-300 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-700">Delete account</h3>
                <p className="text-sm text-red-600 mt-1">This will permanently delete your account, cancel your subscription immediately, and remove your data. This action cannot be undone.</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { if (!deleting) { setShowDeleteModal(false); setConfirmText(''); } }} />
            <div className="relative bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] w-full max-w-md p-6">
              <h4 className="text-lg font-semibold text-[var(--color-neutral-900)]">Confirm account deletion</h4>
              <p className="text-sm text-[var(--color-neutral-700)] mt-2">
                This will permanently delete your account, cancel your subscription immediately, and remove your data. Type <span className="font-mono font-semibold">DELETE</span> to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-4 w-full border border-[var(--color-neutral-300)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)]"
                placeholder="Type DELETE"
                disabled={deleting}
              />
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => { if (!deleting) { setShowDeleteModal(false); setConfirmText(''); } }}
                  className="px-4 py-2 rounded-lg border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  disabled={confirmText !== 'DELETE' || deleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60 hover:bg-red-700"
                >
                  {deleting ? 'Deleting…' : 'Confirm delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel subscription confirmation modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { if (!cancelling) { setShowCancelModal(false); } }} />
            <div className="relative bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] w-full max-w-md p-6">
              <h4 className="text-lg font-semibold text-[var(--color-neutral-900)]">Cancel subscription</h4>
              <p className="text-sm text-[var(--color-neutral-700)] mt-2">
                Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => { if (!cancelling) { setShowCancelModal(false); } }}
                  className="px-4 py-2 rounded-lg border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
                  disabled={cancelling}
                >
                  Keep subscription
                </button>
                <button
                  onClick={confirmCancelSubscription}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60 hover:bg-red-700"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel subscription'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 