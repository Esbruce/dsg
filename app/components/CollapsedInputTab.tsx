import React from "react";

type CollapsedInputTabProps = {
  onClick: () => void;
  characterCount: number;
};

export default function CollapsedInputTab({ onClick, characterCount }: CollapsedInputTabProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onClick}
        className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Medical Notes</h3>
            <p className="text-sm text-gray-500">{characterCount} characters</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm">Click to expand</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    </div>
  );
} 