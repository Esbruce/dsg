import { getReferralUUIDForUserCreation } from './referral-utils';

/**
 * Client-side utility to create a user with referral UUID handling
 */
export async function createUserWithReferral(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get any stored referral UUID
    const referralUUID = getReferralUUIDForUserCreation();
    
    // Validate referral UUID if present
    let referrerId: string | null = null;
    
    if (referralUUID) {
      try {
        const response = await fetch('/api/referrals/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ referralUUID })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.valid) {
            referrerId = result.referrerId;
          }
        }
      } catch (error) {
        console.error('Error validating referral UUID:', error);
        // Continue without referral if validation fails
      }
    }

    // Create user with referral data
    const response = await fetch('/api/supabase/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        referred_by: referrerId 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    // Only clear referral after successful server confirmation
    try { 
      const { clearStoredReferralCode } = await import('./referral-utils');
      clearStoredReferralCode();
    } catch {}

    return { success: true };
  } catch (error) {
    console.error('Error creating user with referral:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user' 
    };
  }
} 