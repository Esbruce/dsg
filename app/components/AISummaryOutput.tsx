import React from "react";

type AISummaryOutputProps = {
  summary: string;
  onCopy: () => void;
  copied: boolean;
  characterCount: number;
  onSummaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function AISummaryOutput({ summary, onCopy, copied, characterCount, onSummaryChange }: AISummaryOutputProps) {
  const [dischargePlan, setDischargePlan] = React.useState("");
  const [copiedPlan, setCopiedPlan] = React.useState(false);

  const handleCopyPlan = async () => {
    try {
      await navigator.clipboard.writeText(dischargePlan);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      <h2 className="text-lg font-medium text-left text-gray-900 flex flex-row items-center mb-4" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <svg className="w-6 h-6 mr-2" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        AI Summary
      </h2>
      <textarea
        value={summary}
        onChange={onSummaryChange}
        placeholder="Summary will appear here. Enter medical notes and click 'Generate Summary'"
        className="w-full h-80 p-4 border border-gray-400 rounded-xl resize-none text-gray-700 placeholder-gray-400 focus:outline-none bg-gray-50 whitespace-pre-wrap leading-relaxed overflow-auto"
      />
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">{characterCount} characters</span>
        <button
          onClick={onCopy}
          className="transition-colors text-sm font-medium flex items-center"
          style={{ color: 'rgba(4,179,190,1)' }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* Discharge Plan Box */}
      <textarea
        value={dischargePlan}
        onChange={e => setDischargePlan(e.target.value)}
        placeholder="Discharge plan will appear here..."
        className="w-full h-24 p-4 border border-gray-400 rounded-xl resize-none text-gray-700 placeholder-gray-400 focus:outline-none bg-gray-50 whitespace-pre-wrap leading-relaxed overflow-auto mb-2"
      />
      <div className="flex justify-end">
        <button
          onClick={handleCopyPlan}
          className="transition-colors text-sm font-medium flex items-center"
          style={{ color: 'rgba(4,179,190,1)' }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copiedPlan ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="text-sm text-gray-500 text-left mb-2">{dischargePlan.length} characters</div>
    </>
  );
} 