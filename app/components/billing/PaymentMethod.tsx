"use client";

import { SubscriptionData } from "../../(app)/billing/types";

interface PaymentMethodProps {
  subscriptionData: SubscriptionData | null;
}

export default function PaymentMethod({ subscriptionData }: PaymentMethodProps) {
  if (!subscriptionData?.paymentMethod) {
    return null;
  }

  const { paymentMethod } = subscriptionData;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
      <div className="flex items-center gap-4">
        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-gray-600 uppercase">
            {paymentMethod.brand}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            •••• •••• •••• {paymentMethod.last4}
          </div>
          <div className="text-sm text-gray-600">
            Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
          </div>
        </div>
      </div>
    </div>
  );
} 