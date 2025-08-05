import React from 'react';

export default function BillingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Subscription Status Skeleton */}
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Payment Method Skeleton */}
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mx-auto"></div>
        </div>
      </div>

      {/* Billing Actions Skeleton */}
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
        <div className="space-y-3">
          <div className="w-full flex items-center justify-between p-4 border border-[var(--color-neutral-200)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-36 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 