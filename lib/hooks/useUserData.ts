import { useContext, createContext } from "react";

// Enhanced context interface
export interface UserDataContextType {
  // Basic user data
  userEmail: string | null;
  userPhone: string | null;
  userIdentifier: string | null; // Either email or phone for display
  usageCount: number;
  isPaid: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Referral data (centralized)
  referralData: {
    referralLink: string;
    hasBeenReferred: boolean;
    referrerInfo?: any;
  } | null;
  discountData: {
    hasDiscount: boolean;
    discountPercentage: number;
  } | null;
  inviteMessage?: string | null;
  referralProgress?: {
    convertedCount: number;
    milestonesEarned: number;
    invitesToNext: number;
    unlimitedUntil: string | null;
  } | null;
  unlimitedActive?: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

// Create enhanced context
export const UserDataContext = createContext<UserDataContextType>({
  userEmail: null,
  userPhone: null,
  userIdentifier: null,
  usageCount: 0,
  isPaid: false,
  isLoading: true,
  isAuthenticated: false,
  referralData: null,
  discountData: null,
  inviteMessage: null,
  referralProgress: null,
  unlimitedActive: false,
  refreshUserData: async () => {},
  refreshAll: async () => {},
});

// Export hook for using the context
export const useUserData = (): UserDataContextType => useContext(UserDataContext); 