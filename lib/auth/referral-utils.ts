/**
 * Utility functions for handling referral codes in the authentication flow
 */

const REFERRAL_STORAGE_KEY = 'pending_referral_code';

/**
 * Extract referral code from URL search parameters
 */
export function getReferralCodeFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Store referral code in localStorage for later use
 */
export function storeReferralCode(referralCode: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
  } catch (error) {
    console.error('Failed to store referral code:', error);
  }
}

/**
 * Get stored referral code from localStorage
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get stored referral code:', error);
    return null;
  }
}

/**
 * Clear stored referral code from localStorage
 */
export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored referral code:', error);
  }
}

/**
 * Validate referral UUID format
 */
export function validateReferralUUID(uuid: string): boolean {
  // UUID validation: 8-4-4-4-12 format
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Process referral UUID from URL and store it
 * This should be called when the app loads
 */
export function processReferralUUIDFromURL(): void {
  const referralUUID = getReferralCodeFromURL();
  
  if (referralUUID && validateReferralUUID(referralUUID)) {
    storeReferralCode(referralUUID);
    
    // Don't immediately clean up URL - let the UI show the referral info
    // The URL will be cleaned up when the user completes signup
  }
}

/**
 * Clean up referral URL after successful signup
 * This should be called after the user is successfully created
 */
export function cleanupReferralURL(): void {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Get referral UUID for user creation
 * This should be called when creating a new user
 */
export function getReferralUUIDForUserCreation(): string | null {
  const referralUUID = getStoredReferralCode();
  
  if (referralUUID && validateReferralUUID(referralUUID)) {
    // Do NOT clear here; defer clearing until server confirms success
    return referralUUID;
  }
  
  return null;
}