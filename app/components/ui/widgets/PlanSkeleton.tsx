import React from "react";

export function PlanSkeleton() {
  return (
    <div className="bg-gray-200/80 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-300/80 rounded-lg"></div>
        <div className="h-6 bg-gray-300/80 rounded w-2/3"></div>
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 bg-gray-300/80 rounded w-full"></div>
        <div className="h-3 bg-gray-300/80 rounded w-5/6"></div>
      </div>
      <div className="h-12 bg-gray-300/80 rounded-lg"></div>
    </div>
  );
}
