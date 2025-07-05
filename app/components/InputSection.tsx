import React from "react";
import MedicalNotesInput from "./MedicalNotesInput";
import ProcessButton from "./ProcessButton";

type InputSectionProps = {
  medicalNotes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  confirmNoPII: boolean;
  onConfirmNoPIIChange: (checked: boolean) => void;
  onProcess: () => void;
  isProcessing: boolean;
  isCollapsed: boolean;
  onCollapse: () => void;
};

export default function InputSection({
  medicalNotes,
  onNotesChange,
  onClear,
  confirmNoPII,
  onConfirmNoPIIChange,
  onProcess,
  isProcessing,
  isCollapsed,
  onCollapse
}: InputSectionProps) {
  if (isCollapsed) {
    return null; // Handled by CollapsedInputTab
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-space-between justify-center">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white mb-3">
          Clerk notes to {" "}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Discharge Summary and Plan
          </span>
        </h1>
      </div>

      {/* Input Container */}
      <div className="bg-white/15 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 shadow-2xl">
        <div className="space-y-4">
          {/* Medical Notes Input */}
          <div className="relative">
            <textarea
              value={medicalNotes}
              onChange={onNotesChange}
              placeholder="Enter your medical documentation here... (patient history, symptoms, treatments, etc.)"
              rows={8}
              className="w-full p-4 rounded-2xl bg-gray-900/80 border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-white placeholder-gray-400 text-lg backdrop-blur-sm"
            />
            
            {/* Character Count & Clear Button */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-sm">{medicalNotes.length} characters</span>
              {medicalNotes.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-red-400 hover:text-slate-800 transition-colors font-medium text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Privacy Confirmation */}
          <div className="flex items-center gap-3 p-3 bg-amber-900/30 border border-amber-600/50 rounded-xl backdrop-blur-sm">
            <input
              id="no-pii-checkbox"
              type="checkbox"
              checked={confirmNoPII}
              onChange={(e) => onConfirmNoPIIChange(e.target.checked)}
              className="w-5 h-5 bg-white rounded-full
                         checked:bg-black
                         transition-all duration-200 cursor-pointer"
            />
            <label htmlFor="no-pii-checkbox" className="text-amber-200 font-medium cursor-pointer flex items-center gap-2">
            I confirm no patient-identifiable information has been entered
            </label>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <button
              onClick={onProcess}
              disabled={isProcessing || !medicalNotes.trim() || !confirmNoPII}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 ${
                isProcessing || !medicalNotes.trim() || !confirmNoPII
                  ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-slate-100 hover:shadow-blue-500/25 transform hover:scale-102'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate AI Summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 