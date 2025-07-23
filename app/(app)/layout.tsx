"use client";

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import DesktopOnlyOverlay from "../components/layout/DesktopOnlyOverlay";
import { LoginModalProvider } from "../components/auth";
import { SessionTimeoutWarning } from "../components/auth/SessionTimeoutWarning";

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
  const inviteLink = "https://dsg.com/invite/user123"; // This should be dynamic based on user

  // Enhanced fetch user data function with performance optimizations
  const fetchUserData = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Get user and status in parallel for better performance
      const [authResult, statusRes] = await Promise.allSettled([
        supabase.auth.getUser(),
        fetch("/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      ]);

      // Handle authentication result
      if (authResult.status === 'rejected') {
        setIsAuthenticated(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      const { data: { user } } = authResult.value;
      
      if (!user) {
        setIsAuthenticated(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);
      
      // Set user identifier for display (prefer email, fallback to phone)
      const identifier = user.email || user.phone || null;
      setUserIdentifier(identifier);

      // Handle status result
      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const { user: userStatus } = await statusRes.value.json();
        if (userStatus) {
          setUsageCount(userStatus.daily_usage_count || 0);
          setIsPaid(userStatus.is_paid || false);
        } else {
          setUsageCount(0);
          setIsPaid(false);
        }
      } else {
        
        // Check if the failure is due to user not existing in the database
        if (statusRes.status === 'fulfilled' && statusRes.value.status === 404) {
          // Check if user record exists using API endpoint
          try {
            const checkUserRes = await fetch("/api/user/check-exists", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            
            if (checkUserRes.ok) {
              const { exists } = await checkUserRes.json();
              
              if (!exists) {
                // User doesn't exist in users table, create the record
                try {
                  const createUserRes = await fetch("/api/supabase/create-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  });
                  
                  if (createUserRes.ok) {
                    // Retry fetching user status
                    const retryStatusRes = await fetch("/api/user/status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    
                    if (retryStatusRes.ok) {
                      const { user: userStatus } = await retryStatusRes.json();
                      if (userStatus) {
                        setUsageCount(userStatus.daily_usage_count || 0);
                        setIsPaid(userStatus.is_paid || false);
                      }
                    }
                  } else {
                    setUsageCount(0);
                    setIsPaid(false);
                  }
                } catch (createError) {
                  setUsageCount(0);
                  setIsPaid(false);
                }
              } else {
                setUsageCount(0);
                setIsPaid(false);
              }
            } else {
              setUsageCount(0);
              setIsPaid(false);
            }
          } catch (checkError) {
            setUsageCount(0);
            setIsPaid(false);
          }
        } else {
          setUsageCount(0);
          setIsPaid(false);
        }
      }
    } catch (error) {
      setUsageCount(0);
      setIsPaid(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

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
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout (reduced due to parallel requests)
    
    fetchUserData();

    // Create Supabase client for auth listener
    const supabase = createClient();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserPhone(null);
        setUserIdentifier(null);
        setUsageCount(0);
        setIsPaid(false);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        // Set authentication state immediately
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        setUserPhone(session.user.phone || null);
        
        // Set user identifier for display (prefer email, fallback to phone)
        const identifier = session.user.email || session.user.phone || null;
        setUserIdentifier(identifier);
        
        // Add a small delay to ensure session is fully established
        setTimeout(async () => {
          await fetchUserData();
        }, 100);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh user data when token is refreshed
        await fetchUserData();
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