"use client";

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { createClient } from "../../lib/supabase/client";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import DesktopOnlyOverlay from "../components/layout/DesktopOnlyOverlay";
import { LoginModalProvider } from "../components/auth";

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
    console.log('🔄 Starting fetchUserData...');
    try {
      const supabase = createClient();
      console.log('✅ Supabase client created');
      
      // Get user and status in parallel for better performance
      const [authResult, statusRes] = await Promise.allSettled([
        supabase.auth.getUser(),
        fetch("/api/user/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      ]);

      console.log('✅ Parallel requests completed');

      // Handle authentication result
      if (authResult.status === 'rejected') {
        console.error('❌ Auth failed:', authResult.reason);
        setIsAuthenticated(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      const { data: { user } } = authResult.value;
      console.log('✅ Auth getUser completed, user:', user?.id);
      
      if (!user) {
        console.log('❌ No user found, setting unauthenticated state');
        setIsAuthenticated(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ User authenticated');
      setIsAuthenticated(true);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);
      
      // Set user identifier for display (prefer email, fallback to phone)
      const identifier = user.email || user.phone || null;
      setUserIdentifier(identifier);

      // Handle status result
      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const { user: userStatus } = await statusRes.value.json();
        console.log('✅ User status data:', userStatus);
        if (userStatus) {
          console.log('✅ Setting user data:', {
            usageCount: userStatus.daily_usage_count || 0,
            isPaid: userStatus.is_paid || false
          });
          setUsageCount(userStatus.daily_usage_count || 0);
          setIsPaid(userStatus.is_paid || false);
        } else {
          console.log('❌ No user status data returned');
          setUsageCount(0);
          setIsPaid(false);
        }
      } else {
        console.log('❌ Status API failed:', statusRes.status, statusRes.status === 'rejected' ? statusRes.reason : 'Unknown error');
        
        // Check if the failure is due to user not existing in the database
        if (statusRes.status === 'fulfilled' && statusRes.value.status === 404) {
          console.log('🔧 User not found in database, checking if user record exists...');
          
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
                console.log('🔧 User record does not exist, creating...');
                try {
                  const createUserRes = await fetch("/api/supabase/create-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  });
                  
                  if (createUserRes.ok) {
                    console.log('✅ User record created successfully');
                    // Retry fetching user status
                    const retryStatusRes = await fetch("/api/user/status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    
                    if (retryStatusRes.ok) {
                      const { user: userStatus } = await retryStatusRes.json();
                      console.log('✅ Retry user status data:', userStatus);
                      if (userStatus) {
                        setUsageCount(userStatus.daily_usage_count || 0);
                        setIsPaid(userStatus.is_paid || false);
                      }
                    }
                  } else {
                    console.log('❌ Failed to create user record');
                    setUsageCount(0);
                    setIsPaid(false);
                  }
                } catch (createError) {
                  console.log('❌ Error creating user record:', createError);
                  setUsageCount(0);
                  setIsPaid(false);
                }
              } else {
                console.log('✅ User record exists but status API failed for other reasons');
                setUsageCount(0);
                setIsPaid(false);
              }
            } else {
              console.log('❌ Failed to check user existence');
              setUsageCount(0);
              setIsPaid(false);
            }
          } catch (checkError) {
            console.log('❌ Error checking user record:', checkError);
            setUsageCount(0);
            setIsPaid(false);
          }
        } else {
          setUsageCount(0);
          setIsPaid(false);
        }
      }
    } catch (error) {
      console.error('❌ Error in fetchUserData:', error);
      setUsageCount(0);
      setIsPaid(false);
    } finally {
      console.log('✅ Setting isLoading to false');
      setIsLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state

  // Enhanced refresh function with immediate polling
  const refreshUserDataWithPolling = useCallback(async () => {
    console.log('🔄 Starting enhanced refresh with polling...');
    await fetchUserData();
    
    // If user is authenticated, do an immediate follow-up check for payment status
    if (isAuthenticated) {
      setTimeout(async () => {
        try {
          console.log('🔄 Immediate payment status check...');
          const statusRes = await fetch("/api/user/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          
          if (statusRes.ok) {
            const { user: userStatus } = await statusRes.json();
            if (userStatus) {
              if (userStatus.is_paid !== isPaid || userStatus.daily_usage_count !== usageCount) {
                console.log('🔄 Payment status updated on immediate check:', {
                  oldIsPaid: isPaid,
                  newIsPaid: userStatus.is_paid,
                  oldUsageCount: usageCount,
                  newUsageCount: userStatus.daily_usage_count
                });
                setUsageCount(userStatus.daily_usage_count || 0);
                setIsPaid(userStatus.is_paid || false);
              }
            }
          }
        } catch (error) {
          console.error('❌ Immediate payment status check failed:', error);
        }
      }, 1000); // Check again after 1 second
    }
  }, [fetchUserData, isAuthenticated, isPaid, usageCount]);

  // For unauthenticated users, use mock data but show full interface
  const displayUsageCount = isAuthenticated ? usageCount : 0; // 0 summaries used = 3 remaining
  const displayIsPaid = isAuthenticated ? isPaid : false;
  const displayUserEmail = isAuthenticated ? userIdentifier : null; // Use identifier (email or phone)
  
  // Debug logging
  console.log('🔍 Layout state:', {
    isAuthenticated,
    userEmail,
    usageCount,
    isPaid,
    isLoading,
    displayUserEmail,
    displayUsageCount,
    displayIsPaid
  });

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
      refreshUserData: refreshUserDataWithPolling,
      refreshAll: refreshUserDataWithPolling, // Use enhanced version
    };
    console.log('🔄 Context value updated:', value);
    return value;
  }, [displayUserEmail, userPhone, userIdentifier, displayUsageCount, displayIsPaid, isLoading, isAuthenticated, refreshUserDataWithPolling]);

  // Fetch user data on component mount and listen for auth changes
  useEffect(() => {
    console.log('🔄 Layout useEffect triggered');
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⚠️ Loading timeout reached, forcing isLoading to false');
      setIsLoading(false);
    }, 5000); // 5 second timeout (reduced due to parallel requests)
    
    fetchUserData();

    // Create Supabase client for auth listener
    const supabase = createClient();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, updating state...');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserPhone(null);
        setUserIdentifier(null);
        setUsageCount(0);
        setIsPaid(false);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        console.log('👋 User signed in, fetching user data...');
        console.log('👋 Session user:', session.user);
        
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
        console.log('🔄 Token refreshed, ensuring user data is current...');
        // Refresh user data when token is refreshed
        await fetchUserData();
      }
    });

    // Set up polling for payment status changes (useful for webhook delays)
    let pollInterval: NodeJS.Timeout | null = null;
    if (isAuthenticated) {
      pollInterval = setInterval(async () => {
        try {
          console.log('🔄 Polling for payment status changes...');
          const statusRes = await fetch("/api/user/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          
          if (statusRes.ok) {
            const { user: userStatus } = await statusRes.json();
            if (userStatus) {
              // Only update if there's a change to avoid unnecessary re-renders
              if (userStatus.is_paid !== isPaid || userStatus.daily_usage_count !== usageCount) {
                console.log('🔄 Payment status changed via polling:', {
                  oldIsPaid: isPaid,
                  newIsPaid: userStatus.is_paid,
                  oldUsageCount: usageCount,
                  newUsageCount: userStatus.daily_usage_count
                });
                setUsageCount(userStatus.daily_usage_count || 0);
                setIsPaid(userStatus.is_paid || false);
              }
            }
          }
        } catch (error) {
          console.error('❌ Polling error:', error);
        }
      }, 30000); // Poll every 30 seconds
    }

    // Cleanup subscription and polling on unmount
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
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
      </UserDataContext.Provider>
    </LoginModalProvider>
  );
} 