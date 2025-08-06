import React from "react";

export function UsageSkeleton() {
  return (
    <div className="rounded-xl p-4 border border-gray-200/50 animate-pulse">
      <div className="h-4 bg-gray-200/80 rounded w-2/4 mb-3"></div>
      <div className="h-5 bg-gray-200/80 rounded w-1/3 mb-3"></div>
      <div className="h-2 bg-gray-200/80 rounded-full w-full"></div>
    </div>
  );
}
