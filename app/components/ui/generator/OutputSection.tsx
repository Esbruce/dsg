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
  onBackToInput: () => void;
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
  isVisible,
  onBackToInput
}: OutputSectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Back to Input Button */}
      <div className="mb-4 md:mb-8">
        <button
          onClick={onBackToInput}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors shadow-sm typography-button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Input
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 h-full flex-1">

        {/* AI Summary Panel */}
        <div className="flex-1 backdrop-blur-2xl bg-[var(--color-bg-1)] shadow-symmetric border border-[var(--color-neutral-300)] rounded-2xl p-4 md:p-8 flex flex-col">
          <div className="mb-6 flex flex-col">
            <div className="flex items-center justify-center pb-4">
              <h2 className="typography-h2 font-semibold text-[var(--color-neutral-900)]">Summary</h2>
            </div>
            <div className="border-b border-[var(--color-neutral-300)] -mx-4 md:-mx-8"></div>
          </div>
          
          <textarea
            value={summary}
            onChange={onSummaryChange}
            placeholder="AI summary will appear here..."
            className="w-full px-0 py-4 rounded-xl bg-transparent border-0 focus:outline-none focus:ring-0 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-[300px] md:min-h-[400px] typography-body"
          />
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base text-[var(--color-neutral-500)] font-medium">
              {summary.length} characters
            </span>
            <button
              onClick={onCopySummary}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {summaryCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Discharge Plan Panel */}
        <div className="flex-1 backdrop-blur-2xl bg-[var(--color-bg-1)] shadow-symmetric border border-[var(--color-neutral-300)] rounded-2xl p-4 md:p-8 flex flex-col">
          <div className="mb-6 flex flex-col">
            <div className="flex items-center justify-center pb-4">
              <h2 className="typography-h2 font-semibold text-[var(--color-neutral-900)]">Discharge Plan</h2>
            </div>
            <div className="border-b border-[var(--color-neutral-300)] -mx-4 md:-mx-8"></div>
          </div>
          
          <textarea
            value={dischargePlan}
            onChange={onDischargePlanChange}
            placeholder="Discharge plan will appear here..."
            className="w-full px-0 py-4 rounded-xl bg-transparent border-0 focus:outline-none focus:ring-0 transition-all resize-none text-[var(--color-neutral-700)] placeholder-[var(--color-neutral-400)] flex-1 min-h-[300px] md:min-h-[400px] typography-body"
          />
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base text-[var(--color-neutral-500)] font-medium">
              {dischargePlan.length} characters
            </span>
            <button
              onClick={onCopyDischargePlan}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {dischargePlanCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 