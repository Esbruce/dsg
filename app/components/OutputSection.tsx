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
    <div className="flex gap-8 h-full min-h-[600px]">
      {/* AI Summary Panel */}
      <div className="flex-1 backdrop-blur-2xl bg-[var(--color-bg-1)] shadow-symmetric rounded-2xl p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)]">Summary</h2>
              <p className="text-base text-[var(--color-neutral-600)] mt-1">Generated medical summary</p>
            </div>
          </div>
          <button
            onClick={onCopySummary}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-light)] transition-colors font-medium text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {summaryCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <textarea
          value={summary}
          onChange={onSummaryChange}
          placeholder="AI summary will appear here..."
          className="w-full p-6 rounded-xl bg-transparent border-0 focus:outline-none focus:ring-0 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-[400px] text-base leading-relaxed"
        />
        
        <div className="mt-4 text-base text-[var(--color-neutral-500)] font-medium">
          {summary.length} characters
        </div>
      </div>

      {/* Discharge Plan Panel */}
      <div className="flex-1 backdrop-blur-2xl bg-[var(--color-bg-1)] shadow-symmetric rounded-2xl p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-neutral-900)]">Discharge Plan</h2>
              <p className="text-base text-[var(--color-neutral-600)] mt-1">Generated discharge planning</p>
            </div>
          </div>
          <button
            onClick={onCopyDischargePlan}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] rounded-xl hover:bg-[var(--color-secondary)]/30 transition-colors font-medium text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {dischargePlanCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <textarea
          value={dischargePlan}
          onChange={onDischargePlanChange}
          placeholder="Discharge plan will appear here..."
          className="w-full p-6 rounded-xl bg-transparent border-0 focus:outline-none focus:ring-0 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-[400px] text-base leading-relaxed"
        />
        
        <div className="mt-4 text-base text-[var(--color-neutral-500)] font-medium">
          {dischargePlan.length} characters
        </div>
      </div>
    </div>
  );
} 