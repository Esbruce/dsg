import React from "react";

type OutputSectionProps = {
  summary: string;
  dischargePlan: string;
  onSummaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDischargePlanChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopySummary: () => void;
  onCopyDischargePlan: () => void;
  summaryCopied: boolean;
  dischargePlanCopied: boolean;
  isVisible: boolean;
};

export default function OutputSection({
  summary,
  dischargePlan,
  onSummaryChange,
  onDischargePlanChange,
  onCopySummary,
  onCopyDischargePlan,
  summaryCopied,
  dischargePlanCopied,
  isVisible
}: OutputSectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Summary</h2>
              <p className="text-sm text-gray-600">Generated medical summary</p>
            </div>
          </div>
          <button
            onClick={onCopySummary}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {summaryCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <textarea
          value={summary}
          onChange={onSummaryChange}
          placeholder="AI summary will appear here..."
          rows={10}
          className="w-full p-4 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none text-gray-700 placeholder-gray-400"
        />
        
        <div className="mt-2 text-sm text-gray-500">
          {summary.length} characters
        </div>
      </div>

      {/* Discharge Plan Panel */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Discharge Plan</h2>
              <p className="text-sm text-gray-600">Generated discharge planning</p>
            </div>
          </div>
          <button
            onClick={onCopyDischargePlan}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {dischargePlanCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <textarea
          value={dischargePlan}
          onChange={onDischargePlanChange}
          placeholder="Discharge plan will appear here..."
          rows={8}
          className="w-full p-4 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all resize-none text-gray-700 placeholder-gray-400"
        />
        
        <div className="mt-2 text-sm text-gray-500">
          {dischargePlan.length} characters
        </div>
      </div>
    </div>
  );
} 