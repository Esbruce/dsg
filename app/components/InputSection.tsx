import React from "react";

type InputSectionProps = {
  medicalNotes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  confirmNoPII: boolean;
  onConfirmNoPIIChange: (checked: boolean) => void;
  onProcess: () => void;
  isProcessing: boolean;
};

export default function InputSection({
  medicalNotes,
  onNotesChange,
  onClear,
  confirmNoPII,
  onConfirmNoPIIChange,
  onProcess,
  isProcessing
}: InputSectionProps) {

  return (
    <div className="w-full h-full flex flex-col">
      {/* Input Container */}
      <div className="backdrop-blur-2xl bg-[var(--color-bg-1)] shadow-symmetric rounded-2xl p-8 flex-1 flex flex-col">
        <div className="relative z-[3] flex-1 flex flex-col">
          {/* Medical Notes Input */}
          <div className="relative flex-1 flex flex-col mb-4">
            <div className="rounded-2xl relative flex-1 flex flex-col">
              <textarea
                value={medicalNotes}
                onChange={onNotesChange}
                placeholder="Enter your medical documentation here ..."
                className="w-full h-full p-6 rounded-2xl bg-transparent border-0 focus:outline-none focus:ring-0 transition-all resize-none text-black placeholder-[var(--color-neutral-400)] text-xl relative z-[3] flex-1 leading-relaxed"
              />
            </div> 
            {/* Character Count & Clear Button */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-[var(--color-neutral-400)] text-base font-medium">{medicalNotes.length} characters</span>
              {medicalNotes.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-[var(--color-error)] font-medium text-base flex items-center gap-2 hover:text-[var(--color-error)]/80 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Privacy Confirmation & Process Button Row */}
          <div className="flex items-stretch justify-between gap-4 flex-shrink-0">
            {/* Privacy Confirmation */}
            <div className="flex items-center gap-3 p-4 bg-[var(--color-warning)]/20 border border-[var(--color-warning)]/50 rounded-xl backdrop-blur-sm flex-1">
              <div className="relative">
                <input
                  id="no-pii-checkbox"
                  type="checkbox"
                  checked={confirmNoPII}
                  onChange={(e) => onConfirmNoPIIChange(e.target.checked)}
                  className="sr-only"
                />
                <label 
                  htmlFor="no-pii-checkbox" 
                  className={`w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                    confirmNoPII 
                      ? 'bg-white border-gray-400' 
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {confirmNoPII && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              </div>
              <label htmlFor="no-pii-checkbox" className="text-[var(--color-neutral-800)] font-medium cursor-pointer flex items-center gap-2 text-sm">
                I confirm no patient-identifiable information has been entered
              </label>
            </div>
            
            {/* Process Button */}
            <button
              onClick={onProcess}
              disabled={isProcessing || !medicalNotes.trim() || !confirmNoPII}
              className={`group px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg ${
                isProcessing || !medicalNotes.trim() || !confirmNoPII
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 relative">
                    <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  Processing...
                </>
              ) : (
                <>
                  {/* <div className="w-5 h-5 relative">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div> */}
                 Generate {/* Generate Summary & Discharge Plan */}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 