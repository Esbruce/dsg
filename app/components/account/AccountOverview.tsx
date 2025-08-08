import React, { useMemo } from "react";
import { normalizeUKPhoneNumber } from "@/lib/utils/phone";

type AccountOverviewProps = {
  isLoading: boolean;
  userIdentifier: string | null;
  isPaid: boolean;
};

export default function AccountOverview({ isLoading, userIdentifier, isPaid }: AccountOverviewProps) {
  const formattedIdentifier = useMemo(() => {
    if (!userIdentifier) return null;
    const isNumericLike = /^\+?[\d\s]+$/.test(userIdentifier);
    if (!isNumericLike) return userIdentifier;
    const normalized = normalizeUKPhoneNumber(userIdentifier);
    if (!normalized) return userIdentifier;
    // Display as "+44 " followed by the digits with no extra grouping
    return `+44 ${normalized.substring(3)}`;
  }, [userIdentifier]);
  return (
    <div className="col-span-2 bg-[var(--color-bg-1)] rounded-xl p-5 border border-[var(--color-neutral-300)] shadow-symmetric">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-neutral-200)] flex items-center justify-center text-[var(--color-neutral-700)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-[var(--color-neutral-900)] text-sm">
              {isLoading ? 'Loading…' : (formattedIdentifier || '—')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

