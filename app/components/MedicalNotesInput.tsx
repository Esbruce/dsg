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
      <h2 className="text-xl text-center font-semibold text-gray-900 flex flex-row justify-center items-center mb-4">
        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Medical Notes Input
      </h2>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Enter medical notes with relevant details such as diagnosis, admission date, treatment, investigations, and discharge plan here..."
        className="w-full h-80 p-4 border border-gray-500 rounded-xl resize-none text-gray-700 placeholder-gray-400 focus:outline-none"
      />
      <div className="mb-4 mr-2 ml-2 flex justify-between items-center text-sm text-gray-500">
        <span>{characterCount} characters</span>
        <button
          onClick={onClear}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          Clear
        </button>
      </div>
    </>
  );
} 