export function BillingContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* SubscriptionStatus Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
        {/* Header with title and status badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded-full w-20 animate-pulse"></div>
        </div>

        {/* Price and billing date grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* PaymentMethod Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
        <div className="h-6 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-5 bg-gray-200 rounded w-40 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* BillingActions Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {/* Manage Payment Button Skeleton */}
          <div className="w-full flex items-center justify-between p-4 border border-[var(--color-neutral-200)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-44 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-60 animate-pulse"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Cancel Subscription Button Skeleton */}
          <div className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-36 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-52 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-1)] via-[var(--color-bg-2)] to-[var(--color-bg-1)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* BillingHeader Skeleton - matches BillingHeader.tsx structure */}
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded-lg w-80 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Paid User Layout Skeleton - matches the space-y-6 div structure */}
        <BillingContentSkeleton />
      </div>
    </div>
  );
} 