export interface SubscriptionData {
  id: string;
  status: string;
  price: number;
  currency: string;
  interval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  customerId: string;
}

export interface BillingActionsProps {
  subscriptionData: SubscriptionData | null;
  cancelling: boolean;
  onManagePayment: () => void;
  onCancelSubscription: () => void;
} 