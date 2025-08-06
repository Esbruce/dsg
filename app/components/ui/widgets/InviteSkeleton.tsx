import React from "react";

export function InviteSkeleton() {
  return (
    <div className="bg-gray-200/50 rounded-xl p-4 border-transparent animate-pulse">
      <div className="h-4 bg-gray-300/80 rounded w-3/4 mb-4"></div>
      <div className="flex items-center gap-2">
        <div className="h-10 bg-gray-300/80 rounded-lg flex-1"></div>
        <div className="h-10 bg-gray-400/80 rounded-lg w-1/4"></div>
      </div>
    </div>
  );
}
