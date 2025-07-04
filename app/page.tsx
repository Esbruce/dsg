"use client";

import { useState, useRef } from "react";
import Header from "./components/Header";
import MedicalNotesInput from "./components/MedicalNotesInput";
import ProcessButton from "./components/ProcessButton";
import AISummaryOutput from "./components/AISummaryOutput";
import Footer from "./components/Footer";
import { createClient } from "../lib/supabase/client";
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
      // 1. Get user_id from Supabase session
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const user_id = user?.id;

      if (!user_id) {
        alert("User not authenticated");
        setIsProcessing(false);
        return;
      }

      // 2. Check user status
      const statusRes = await fetch("/api/user/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      if (!statusRes.ok) {
        throw new Error(`Status check failed: ${statusRes.status} ${statusRes.statusText}`);
      }

      // Parse status response and extract user information
      const { user: userStatus } = await statusRes.json();
      if (!userStatus) {
        throw new Error("Invalid response from status check");
      }

      // 3. Redirect if over limit and not paid
      if (!userStatus.is_paid && userStatus.daily_usage_count >= 3) {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        });

        if (!checkoutRes.ok) {
          throw new Error(`Checkout failed: ${checkoutRes.status} ${checkoutRes.statusText}`);
        }

        let checkoutData;
        try {
          const checkoutText = await checkoutRes.text();
          checkoutData = checkoutText ? JSON.parse(checkoutText) : {};
        } catch (err) {
          throw new Error("Invalid response from checkout");
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        } else {
          throw new Error("No checkout URL received");
        }
      }

      // 4. Call generate-summary API (handles quota, OpenAI, and DB insertion)
      const summaryRes = await fetch("/api/generate_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, medical_notes: medicalNotes }),
      });

      let summaryData;
      try {
        const summaryText = await summaryRes.text();
        summaryData = summaryText ? JSON.parse(summaryText) : {};
      } catch (err) {
        throw new Error("Invalid response from summary API");
      }

      if (!summaryRes.ok) {
        throw new Error(summaryData.error || `Summary generation failed: ${summaryRes.status} ${summaryRes.statusText}`);
      }

      const summaryText = summaryData.summary || "";
      setSummary(summaryText);

      // 3. Scroll to summary box
      setTimeout(() => {
        aiSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <main className="flex-1 flex flex-col items-center justify-start px-2 pt-[128px] pb-8">
        <Header />
        <div className="mb-6" />
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-start min-h-[50vh]">
          {/* Input Section */}
          <section className="w-full bg-white rounded-3xl flex flex-col p-8 gap-4 shadow-md border border-[var(--color-gray-200)] text-center min-h-[400px] max-h-[80vh]">
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
                className="w-5 h-5 mr-2 rounded focus:ring-0 border border-[var(--color-gray-200)] text-[var(--color-primary)] accent-[var(--color-primary)] cursor-pointer"
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
          <section ref={aiSummaryRef} className="w-full bg-white border-t-4 border-[var(--color-primary)] rounded-3xl p-6 flex flex-col gap-5 shadow-md min-h-[270px] max-h-[70vh] overflow-auto">
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
