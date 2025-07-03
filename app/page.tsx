"use client";

import { useState, useRef } from "react";
import Header from "./components/Header";
import MedicalNotesInput from "./components/MedicalNotesInput";
import ProcessButton from "./components/ProcessButton";
import AISummaryOutput from "./components/AISummaryOutput";
import Footer from "./components/Footer";
import { createClient } from "../lib/supabase/client";
import type { TablesInsert } from "../lib/supabase/types";
import "./globals.css";

export default function Home() {
  const [medicalNotes, setMedicalNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmNoPII, setConfirmNoPII] = useState(false);
  const aiSummaryRef = useRef<HTMLDivElement>(null);

  const handleProcess = async () => {
    if (!medicalNotes.trim()) {
      alert("Please enter medical notes to process");
      return;
    }
    setIsProcessing(true);
    try {
      // Send medicalNotes to the OpenAI API route
      const openaiRes = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicalNotes }),
      });
      if (!openaiRes.ok) {
        throw new Error("Failed to generate summary");
      }
      const openaiData = await openaiRes.json();
      const summary = openaiData.summary || "";
      setSummary(summary);
      // Insert into Supabase
      const supabase = createClient();
      const { error } = await supabase
        .from("records")
        .insert([
          {
            medical_notes: medicalNotes,
            summary: summary,
            responses: null,
          } as TablesInsert<'records'>
        ]);
      if (error) {
        alert("Failed to save to database: " + error.message);
      }
      // Scroll to AI Summary box
      setTimeout(() => {
        aiSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      alert("Unexpected error: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
  };

  return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 flex flex-col items-center justify-center px-2 py-8">
          <Header />
          <div className="mb-8" />
          <div className="w-full max-w-5xl flex flex-col gap-8 items-center min-h-[50vh]">
            {/* Input Section */}
            <section className="w-full bg-white rounded-2xl flex flex-col p-6 gap-4 shadow-sm min-h-[400px] max-h-[80vh] text-center">
              <MedicalNotesInput
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                onClear={() => setMedicalNotes("")}
                characterCount={medicalNotes.length}
              />
              <div className="flex items-center justify-start mb-2">
                <input
                  id="no-pii-checkbox"
                  type="checkbox"
                  checked={confirmNoPII}
                  onChange={e => setConfirmNoPII(e.target.checked)}
                  className="accent-[rgba(4,179,190,1)] w-5 h-5 mr-2"
                  style={{ accentColor: 'rgba(4,179,190,1)' }}
                />
                <label htmlFor="no-pii-checkbox" className="text-gray-700 text-sm select-none cursor-pointer">
                  I confirm no patient-identifiable information has been entered
                </label>
              </div>
              <ProcessButton
                onClick={handleProcess}
                disabled={isProcessing || !medicalNotes.trim() || !confirmNoPII}
                loading={isProcessing}
              />
            </section>
            {/* Output Section */}
            <section ref={aiSummaryRef} className="w-full bg-white rounded-2xl p-5 flex flex-col gap-5 shadow-sm min-h-[270px] max-h-[70vh] overflow-auto">
              <AISummaryOutput
                summary={summary}
                onCopy={handleCopy}
                copied={copied}
                characterCount={summary.length}
                onSummaryChange={handleSummaryChange}
              />
            </section>
          </div>
        </main>
        <Footer />
      </div>
  );
}
