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
    <div className="flex gap-6 h-full">
      {/* AI Summary Panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-[var(--color-neutral-200)] p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 bg-[var(--color-success)]/20 rounded-lg ">
              <svg className="w-6 h-6 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div> */}
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">Summary</h2>
              <p className="text-sm text-[var(--color-neutral-600)]">Generated medical summary</p>
            </div>
          </div>
          <button
            onClick={onCopySummary}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-light)] transition-colors font-medium"
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
          className="w-full p-4 rounded-xl border border-[var(--color-neutral-300)] focus:border-[var(--color-success)] focus:ring-2 focus:ring-[var(--color-success)]/20 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-0"
        />
        
        <div className="mt-2 text-sm text-[var(--color-neutral-500)]">
          {summary.length} characters
        </div>
      </div>

      {/* Discharge Plan Panel */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-[var(--color-neutral-200)] p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 bg-[var(--color-secondary)]/20 rounded-lg">
              <svg className="w-6 h-6 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div> */}
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">Discharge Plan</h2>
              <p className="text-sm text-[var(--color-neutral-600)]">Generated discharge planning</p>
            </div>
          </div>
          <button
            onClick={onCopyDischargePlan}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] rounded-lg hover:bg-[var(--color-secondary)]/30 transition-colors font-medium"
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
          className="w-full p-4 rounded-xl border border-[var(--color-neutral-300)] focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-0"
        />
        
        <div className="mt-2 text-sm text-[var(--color-neutral-500)]">
          {dischargePlan.length} characters
        </div>
      </div>
    </div>
  );
} 