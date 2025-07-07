export interface UserStatus {
  daily_usage_count: number;
  is_paid: boolean;
  last_used_at: string;
}

export interface SubscriptionData {
  hasSubscription: boolean;
  status?: string;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: number;
  price?: number;
  currency?: string;
  interval?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  customerEmail?: string;
  message?: string;
}

export interface BillingHandlers {
  onUpgrade: () => void;
  onManagePayment: () => void;
  onCancelSubscription: () => void;
} 