import { useUserData } from './useUserData';

interface ReferralData {
  referralLink: string;
  hasBeenReferred: boolean;
  referrerInfo?: any;
}

export function useReferralData(): ReferralData | null {
  const { referralData } = useUserData();
  return referralData;
} 