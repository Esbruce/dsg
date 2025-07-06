"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // User data states
  const [usageCount, setUsageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const maxUsage = 3;
  const inviteLink = "https://dsg.com/invite/user123"; // This should be dynamic based on user

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch user status
        const statusRes = await fetch("/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (statusRes.ok) {
          const { user: userStatus } = await statusRes.json();
          if (userStatus) {
            setUsageCount(userStatus.daily_usage_count || 0);
            setIsPaid(userStatus.is_paid || false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link: ', err);
    }
  };

  const handleGoUnlimited = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const user_id = user?.id;

      if (!user_id) {
        alert("User not authenticated");
        return;
      }

      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
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

  // Don't render sidebar for unauthenticated users or while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // For unauthenticated users, render without sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-1)] via-[var(--color-bg-2)] to-[var(--color-bg-1)]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[var(--color-bg-2)] via-[var(--color-bg-3)] to-[var(--color-bg-4)] overflow-hidden">
      {/* Sidebar - Fixed width */}
      <Sidebar
        usageCount={usageCount}
        maxUsage={maxUsage}
        inviteLink={inviteLink}
        onCopyInviteLink={handleCopyInviteLink}
        inviteLinkCopied={inviteLinkCopied}
        isPaid={isPaid}
        onGoUnlimited={handleGoUnlimited}
      />

      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 z-50">
          <Header />
        </div>
        
        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 