"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MobileDrawer from "../components/layout/MobileDrawer";
import { LoginModalProvider, SessionTimeoutHandler } from "../components/auth";
import { processReferralUUIDFromURL } from "../../lib/auth/referral-utils";
import { useRequestIntent } from "../../lib/hooks/useRequestIntent";
import { UserDataContext, UserDataContextType } from "../../lib/hooks/useUserData";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { clearRequestIntent } = useRequestIntent();
  // User data states (keep existing pattern for animations)
  const [usageCount, setUsageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Add flag to prevent duplicate fetches
  const [referralData, setReferralData] = useState<any>(null);
  const [discountData, setDiscountData] = useState<any>(null);
  const [referralProgress, setReferralProgress] = useState<any>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [unlimitedActive, setUnlimitedActive] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const maxUsage = 3;

  // Enhanced fetch user data function with performance optimizations
  const fetchUserData = useCallback(async () => {
    // Prevent duplicate fetches using a ref to avoid dependency issues
    if (isFetching) {
      console.log('🔍 fetchUserData: Already fetching, skipping...');
      return;
    }

    console.log('🔍 fetchUserData: Starting...');
    setIsFetching(true);
    
    try {
      const supabase = createClient();
      console.log('🔍 fetchUserData: Supabase client created');
      
      // Get user first (this should be fast)
      console.log('🔍 fetchUserData: Getting user from Supabase...');
      
      // Add timeout to prevent hanging due to CAPTCHA interference
      let authResult;
      try {
        authResult = await Promise.race([
          supabase.auth.getUser(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Supabase auth timeout')), 5000)
          )
        ]);
      } catch (authTimeoutError) {
        console.error('🔍 fetchUserData: Supabase auth timeout - likely due to CAPTCHA interference:', authTimeoutError);
        // Set default values and continue
        setIsLoading(false);
        setIsFetching(false);
        return;
      }

      const { data: { user }, error: authError } = authResult;
      
      console.log('🔍 fetchUserData: Auth result - user:', user ? user.id : 'null', 'error:', authError?.message);

      // Handle authentication result
      if (authError || !user) {
        console.log('🔍 fetchUserData: No user found, clearing state');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserPhone(null);
        setUserIdentifier(null);
        setUsageCount(0);
        setIsPaid(false);
        setInviteLink("");
        setIsLoading(false);
        setIsFetching(false);
        return;
      }
      
      console.log('🔍 fetchUserData: Setting authenticated state');
      setIsAuthenticated(true);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);
      
      // Set user identifier for display (prefer email, fallback to phone)
      const identifier = user.email || user.phone || null;
      setUserIdentifier(identifier);

      // Now fetch all other user data in parallel for performance
      console.log('🔍 fetchUserData: Fetching combined user data...');
      
      const res = await fetch("/api/user/data", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      console.log('🔍 fetchUserData: Combined data fetch completed. Status:', res.status);

      if (res.ok) {
        const { userStatus, referral, discount, referralProgress: progress, inviteMessage: serverInviteMessage } = await res.json();

        // Process user status response
        if (userStatus) {
          setUsageCount(userStatus.daily_usage_count || 0);
          setIsPaid(userStatus.is_paid || false);
        }

        // Process referral data response
        if (referral && referral.referralLink) {
          setInviteLink(referral.referralLink);
          setReferralData(referral);
        }

        // Process discount data response
        if (discount) {
          setDiscountData(discount);
        }

        // Process referral progress and unlimited
        if (progress) {
          setReferralProgress(progress);
          const active = progress.unlimitedUntil ? new Date(progress.unlimitedUntil) > new Date() : false;
          setUnlimitedActive(active);
        }

        if (serverInviteMessage) {
          setInviteMessage(serverInviteMessage);
        }
      } else {
        console.error('🔍 fetchUserData: Combined data request failed:', res.status);
      }

      console.log('🔍 fetchUserData: Completed successfully');
    } catch (error) {
      console.error('🔍 fetchUserData: Unexpected error:', error);
    } finally {
      console.log('🔍 fetchUserData: Setting isLoading to false');
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  // Simple refresh function without polling
  const refreshUserData = useCallback(async () => {
    console.log('🔄 Refreshing user data...');
    await fetchUserData();
  }, [fetchUserData]);

  // For unauthenticated users, use mock data but show full interface
  const displayUsageCount = isAuthenticated ? usageCount : 0; // 0 summaries used = 3 remaining
  const displayIsPaid = isAuthenticated ? isPaid : false;
  const displayUnlimited = isAuthenticated ? unlimitedActive : false;
  const displayUserEmail = isAuthenticated ? userIdentifier : null; // Use identifier (email or phone)
  
  // Stable context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const value = {
      userEmail: displayUserEmail,
      userPhone,
      userIdentifier,
      usageCount: displayUsageCount,
      isPaid: displayIsPaid,
      isLoading,
      isAuthenticated,
      referralData,
      discountData,
      referralProgress,
      inviteMessage,
      unlimitedActive: displayUnlimited,
      refreshUserData: refreshUserData,
      refreshAll: refreshUserData,
    };
    return value;
  }, [displayUserEmail, userPhone, userIdentifier, displayUsageCount, displayIsPaid, displayUnlimited, isLoading, isAuthenticated, referralData, discountData, referralProgress, inviteMessage, refreshUserData]);

  // Fetch user data on component mount and listen for auth changes
  useEffect(() => {
    // Process referral UUID from URL on app load
    processReferralUUIDFromURL();
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout (reduced due to parallel requests)
    
    fetchUserData();

    // Create Supabase client for auth listener
    const supabase = createClient();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state change:', event, session ? 'session exists' : 'no session');
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserPhone(null);
        setUserIdentifier(null);
        setUsageCount(0);
        setIsPaid(false);
        setIsLoading(false);
        setIsFetching(false);
        // Clear any stored request intent on logout
        clearRequestIntent();

        // If the user signs out while on a protected page, redirect them to login with returnTo
        try {
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname + window.location.search;
            const isProtected = window.location.pathname.startsWith('/account') || window.location.pathname.startsWith('/settings');
            const alreadyOnLogin = window.location.pathname.startsWith('/login');
            if (isProtected && !alreadyOnLogin) {
              const encoded = encodeURIComponent(currentPath || '/');
              router.push(`/login?returnTo=${encoded}`);
            }
          }
        } catch (err) {
          // no-op: best-effort redirect
        }
      } else if (event === 'SIGNED_IN' && session) {
        console.log('🔍 SIGNED_IN event triggered with session:', session.user.id);
        // Set authentication state immediately and trigger loading state
        setIsAuthenticated(true);
        setIsLoading(true);
        setUserEmail(session.user.email || null);
        setUserPhone(session.user.phone || null);
        
        // Set user identifier for display (prefer email, fallback to phone)
        const identifier = session.user.email || session.user.phone || null;
        setUserIdentifier(identifier);
        
        // Only fetch user data if we're not already fetching
        if (!isFetching) {
          // Add a longer delay to ensure session is fully established and cookies are set
          // Increased delay for production to handle session propagation
          console.log('🔍 Setting timeout for fetchUserData...');
          setTimeout(async () => {
            try {
              console.log('🔄 Fetching user data after sign in...');
              await fetchUserData();
              console.log('✅ fetchUserData completed successfully');
            } catch (error) {
              console.error('❌ Error in fetchUserData timeout:', error);
              // Don't fail the auth flow if user data fetch fails
              // Set loading to false so UI doesn't get stuck
              setIsLoading(false);
              setIsFetching(false);
            }
          }, 1000); // Increased from 500ms to 1000ms for production
        } else {
          console.log('🔍 fetchUserData already in progress, skipping duplicate call');
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Only refresh user data if we're not already fetching
        if (!isFetching) {
          try {
            await fetchUserData();
          } catch (error) {
            console.error('Error fetching user data after token refresh:', error);
          }
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Remove fetchUserData dependency to prevent infinite re-renders

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

  // Show loading state while checking authentication, but never block the dedicated login page
  if (isLoading && !isAuthenticated && pathname !== '/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginModalProvider>
      <UserDataContext.Provider value={contextValue}>
        {/* Main app content */}
        <div className="main-app-content flex min-h-[100dvh] bg-gradient-to-br from-[var(--color-bg-2)] via-[var(--color-bg-3)] to-[var(--color-bg-4)] overflow-hidden">
          {/* Sidebar - show from ~1152px via custom helper */}
          <div className="hidden show-at-1152">
            <Sidebar
              usageCount={displayUsageCount}
              maxUsage={maxUsage}
              inviteLink={inviteLink}
              onCopyInviteLink={handleCopyInviteLink}
              inviteLinkCopied={inviteLinkCopied}
              isPaid={displayIsPaid}
              onGoUnlimited={handleGoUnlimited}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area - Takes remaining space */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 z-50">
              <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
            </div>
            
            {/* Content Area - Scrollable */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile drawer menu */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          usageCount={displayUsageCount}
          maxUsage={maxUsage}
          inviteLink={inviteLink}
          onCopyInviteLink={handleCopyInviteLink}
          inviteLinkCopied={inviteLinkCopied}
          isPaid={displayIsPaid}
          onGoUnlimited={handleGoUnlimited}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          unlimitedActive={displayUnlimited}
          referralProgress={referralProgress}
          onSignInClick={() => {
            const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
            const encoded = encodeURIComponent(currentPath || "/");
            router.push(`/login?returnTo=${encoded}`);
          }}
          initialInviteMessage={inviteMessage || undefined}
        />

        {/* Session Timeout (headless) */}
        {isAuthenticated && <SessionTimeoutHandler />}
      </UserDataContext.Provider>
    </LoginModalProvider>
  );
}
