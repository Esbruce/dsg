import { useContext } from 'react';
import { useUserData } from './useUserData';

interface ReferralDiscountStatus {
  hasDiscount: boolean;
  discountPercentage: number;
  isLoading: boolean;
  error: string | null;
}

export function useReferralDiscount(): ReferralDiscountStatus {
  const { discountData, isLoading } = useUserData();

  return {
    hasDiscount: discountData?.hasDiscount || false,
    discountPercentage: discountData?.discountPercentage || 0,
    isLoading: isLoading,
    error: null // Errors are handled in the context
  };
} 