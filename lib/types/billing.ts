export interface PaymentMethodData {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export interface SubscriptionData {
  id: string;
  status: string;
  price: number;
  currency: string;
  interval: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  customerId: string;
  paymentMethod?: PaymentMethodData;
}

export interface BillingActionsProps {
  subscriptionData: SubscriptionData | null;
  cancelling: boolean;
  onManagePayment: () => void;
  onCancelSubscription: () => void;
} 