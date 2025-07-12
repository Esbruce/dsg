"use client";

import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DesktopOnlyOverlay from "../components/DesktopOnlyOverlay";

// Enhanced context interface
interface UserDataContextType {
  // Basic user data
  userEmail: string | null;
  usageCount: number;
  isPaid: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Create enhanced context
const UserDataContext = createContext<UserDataContextType>({
  userEmail: null,
  usageCount: 0,
  isPaid: false,
  isLoading: true,
  isAuthenticated: false,
  refreshUserData: async () => {},
  refreshAll: async () => {},
});

// Export hook for using the context
export const useUserData = () => useContext(UserDataContext);

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // User data states (keep existing pattern for animations)
  const [usageCount, setUsageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const maxUsage = 3;
  const inviteLink = "https://dsg.com/invite/user123"; // This should be dynamic based on user

  // Enhanced fetch user data function
  const fetchUserData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(user.email || null);

      // Fetch user status
      const statusRes = await fetch("/api/user/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (statusRes.ok) {
        const { user: userStatus } = await statusRes.json();
        if (userStatus) {
          setUsageCount(userStatus.daily_usage_count || 0);
          setIsPaid(userStatus.is_paid || false);
        }
      } else {
        // Set default values on API failure
        setUsageCount(0);
        setIsPaid(false);
      }
    } catch (error) {
      // Error logged server-side if needed
      setUsageCount(0);
      setIsPaid(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    userEmail,
    usageCount,
    isPaid,
    isLoading,
    isAuthenticated,
    refreshUserData: fetchUserData,
    refreshAll: fetchUserData, // For now, same as refreshUserData
  }), [userEmail, usageCount, isPaid, isLoading, isAuthenticated]);

  // Fetch user data on component mount
  useEffect(() => {
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
    <UserDataContext.Provider value={contextValue}>
      {/* Desktop-only overlay for small screens */}
      <DesktopOnlyOverlay />
      
      {/* Main app content - hidden on mobile */}
      <div className="main-app-content flex h-screen bg-gradient-to-br from-[var(--color-bg-2)] via-[var(--color-bg-3)] to-[var(--color-bg-4)] overflow-hidden">
        {/* Sidebar - Fixed width - Keep props flow for animations */}
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
    </UserDataContext.Provider>
  );
} 