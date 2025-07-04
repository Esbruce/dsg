import React from "react";

type MedicalNotesInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  characterCount: number;
};

export default function MedicalNotesInput({ value, onChange, onClear, characterCount }: MedicalNotesInputProps) {
  return (
    <>
      <h2 className="text-lg font-medium text-left text-gray-900 flex flex-row items-center mb-0" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <svg className="w-6 h-6 mr-2" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Medical Notes Input
      </h2>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Add medical documentation here..."
        rows={6}
        className="w-full p-4 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-gray-50)] shadow-inner border border-transparent transition-all"
      />
      <div className="mb-0 flex justify-between items-center text-sm text-gray-500">
        <span className="ml-1">{characterCount} characters</span>
        <button
          onClick={onClear}
          className="text-red-500 hover:text-red-700 transition-colors mr-1"
        >
          Clear
        </button>
      </div>
    </>
  );
} 