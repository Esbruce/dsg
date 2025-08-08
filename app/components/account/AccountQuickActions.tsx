import React from "react";

type AccountQuickActionsProps = {
  onManagePayment: () => void;
  onCancelSubscription: () => void;
  isPaid: boolean;
  cancelling: boolean;
};

export default function AccountQuickActions({ onManagePayment, onCancelSubscription, isPaid, cancelling }: AccountQuickActionsProps) {
  // Per request, hide the quick actions on the Account page
  return (
    <div className="bg-[var(--color-bg-1)] rounded-xl p-5 border border-[var(--color-neutral-300)] shadow-symmetric flex items-center justify-center text-sm text-[var(--color-neutral-600)]">
      Account actions are available in the Billing & Subscription section below.
    </div>
  );
}

