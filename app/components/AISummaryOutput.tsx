import React from "react";

type AISummaryOutputProps = {
  summary: string;
  onCopy: () => void;
  copied: boolean;
  characterCount: number;
  onSummaryChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function AISummaryOutput({ summary, onCopy, copied, characterCount, onSummaryChange }: AISummaryOutputProps) {
  return (
    <>
      <h2 className="text-xl text-center font-semibold text-gray-900 flex flex-row justify-center items-center mb-4">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {characterCount} characters
        </span>
        <button
          onClick={onCopy}
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </>
  );
} 