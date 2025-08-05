"use client";

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import DesktopOnlyOverlay from "../components/layout/DesktopOnlyOverlay";
import { LoginModalProvider } from "../components/auth";
import { SessionTimeoutWarning } from "../components/auth/SessionTimeoutWarning";
import { processReferralUUIDFromURL } from "../../lib/auth/referral-utils";
import { useRequestIntent } from "../../lib/hooks/useRequestIntent";

// Enhanced context interface
interface UserDataContextType {
  // Basic user data
  userEmail: string | null;
  userPhone: string | null;
  userIdentifier: string | null; // Either email or phone for display
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
  userPhone: null,
  userIdentifier: null,
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
  const { clearRequestIntent } = useRequestIntent();
  // User data states (keep existing pattern for animations)
  const [usageCount, setUsageCount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const maxUsage = 3;
  const [inviteLink, setInviteLink] = useState<string>("");

  // Enhanced fetch user data function with performance optimizations
  const fetchUserData = useCallback(async () => {
    console.log('🔍 fetchUserData: Starting...');
    try {
      const supabase = createClient();
      console.log('🔍 fetchUserData: Supabase client created');
      
      // Get user first (this should be fast)
      console.log('🔍 fetchUserData: Getting user from Supabase...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
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
        return;
      }
      
      console.log('🔍 fetchUserData: Setting authenticated state');
      setIsAuthenticated(true);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);
      
      // Set user identifier for display (prefer email, fallback to phone)
      const identifier = user.email || user.phone || null;
      setUserIdentifier(identifier);

      // Now fetch user status with timeout
      console.log('🔍 fetchUserData: Fetching user status...');
      try {
        const statusRes = await Promise.race([
          fetch("/api/user/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({}),
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('User status request timeout')), 10000)
          )
        ]) as Response;

        console.log('🔍 fetchUserData: Status response received:', statusRes.status);
        
        if (statusRes.ok) {
          console.log('🔍 fetchUserData: Status request successful');
          const { user: userStatus } = await statusRes.json();
          if (userStatus) {
            console.log('🔍 fetchUserData: User status data:', userStatus);
            setUsageCount(userStatus.daily_usage_count || 0);
            setIsPaid(userStatus.is_paid || false);
          } else {
            console.log('🔍 fetchUserData: No user status data');
            setUsageCount(0);
            setIsPaid(false);
          }
        } else if (statusRes.status === 401) {
          console.log('🔍 User status returned 401 - user may not be fully authenticated yet');
          
          // Retry once after a short delay for production timing issues
          setTimeout(async () => {
            try {
              console.log('🔍 Retrying user status after 401...');
              const retryRes = await fetch("/api/user/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
              });
              
              if (retryRes.ok) {
                const { user: retryUserStatus } = await retryRes.json();
                if (retryUserStatus) {
                  console.log('✅ User status retry successful');
                  setUsageCount(retryUserStatus.daily_usage_count || 0);
                  setIsPaid(retryUserStatus.is_paid || false);
                }
              } else {
                console.log('🔍 User status retry also failed:', retryRes.status);
              }
            } catch (retryError) {
              console.error('🔍 User status retry error:', retryError);
            }
          }, 2000);
          
          setUsageCount(0);
          setIsPaid(false);
        } else {
          console.error('🔍 User status unexpected response:', statusRes.status);
          setUsageCount(0);
          setIsPaid(false);
        }
      } catch (statusError) {
        console.error('🔍 User status request failed:', statusError);
        setUsageCount(0);
        setIsPaid(false);
      }

      // Generate invite link for authenticated user (with timeout)
      console.log('🔍 fetchUserData: Fetching referral data...');
      try {
        const referralRes = await Promise.race([
          fetch("/api/referrals/data", {
            method: "GET",
            credentials: "include"
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Referral request timeout')), 5000)
          )
        ]) as Response;
        
        console.log('🔍 fetchUserData: Referral response status:', referralRes.status);
        
        if (referralRes.ok) {
          const referralData = await referralRes.json();
          setInviteLink(referralData.data?.referralLink || "");
          console.log('🔍 fetchUserData: Referral link set');
        } else {
          // Fallback to basic invite link if referral data fails
          setInviteLink(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://dsg.com'}/signup?ref=${user.id}`);
          console.log('🔍 fetchUserData: Using fallback referral link');
        }
      } catch (error) {
        console.error('🔍 fetchUserData: Error fetching referral data:', error);
        // Fallback to basic invite link
        setInviteLink(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://dsg.com'}/signup?ref=${user.id}`);
      }
      
      console.log('🔍 fetchUserData: Completed successfully');
    } catch (error) {
      console.error('🔍 fetchUserData: Unexpected error:', error);
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserPhone(null);
      setUserIdentifier(null);
      setUsageCount(0);
      setIsPaid(false);
      setInviteLink("");
    } finally {
      console.log('🔍 fetchUserData: Setting isLoading to false');
      setIsLoading(false);
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
      refreshUserData: refreshUserData,
      refreshAll: refreshUserData,
    };
    return value;
  }, [displayUserEmail, userPhone, userIdentifier, displayUsageCount, displayIsPaid, isLoading, isAuthenticated, refreshUserData]);

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
        // Clear any stored request intent on logout
        clearRequestIntent();
      } else if (event === 'SIGNED_IN' && session) {
        console.log('🔍 SIGNED_IN event triggered with session:', session.user.id);
        // Set authentication state immediately
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        setUserPhone(session.user.phone || null);
        
        // Set user identifier for display (prefer email, fallback to phone)
        const identifier = session.user.email || session.user.phone || null;
        setUserIdentifier(identifier);
        
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
          }
        }, 1000); // Increased from 500ms to 1000ms for production
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh user data when token is refreshed
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Error fetching user data after token refresh:', error);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserData]); // Remove dependencies that cause frequent restarts

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

  // Show loading state while checking authentication
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

  return (
    <LoginModalProvider>
      <UserDataContext.Provider value={contextValue}>
        {/* Desktop-only overlay for small screens */}
        <DesktopOnlyOverlay />
        
        {/* Main app content - hidden on mobile */}
        <div className="main-app-content flex h-screen bg-gradient-to-br from-[var(--color-bg-2)] via-[var(--color-bg-3)] to-[var(--color-bg-4)] overflow-hidden">
          {/* Sidebar - Fixed width - Use display values for unauthenticated users */}
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

        {/* Session Timeout Warning - Temporarily disabled to debug re-render loop */}
        {/* <SessionTimeoutWarning /> */}
      </UserDataContext.Provider>
    </LoginModalProvider>
  );
} 