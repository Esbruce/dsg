import { useState, useEffect } from 'react';

interface ReferralDiscountStatus {
  hasDiscount: boolean;
  discountPercentage: number;
  isLoading: boolean;
  error: string | null;
}

export function useReferralDiscount(): ReferralDiscountStatus {
  const [status, setStatus] = useState<ReferralDiscountStatus>({
    hasDiscount: false,
    discountPercentage: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    fetchDiscountStatus();
  }, []);

  const fetchDiscountStatus = async () => {
    try {
      const response = await fetch('/api/referrals/discount-status', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStatus({
          ...data,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch discount status');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  return status;
} 