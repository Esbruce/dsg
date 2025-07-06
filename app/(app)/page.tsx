"use client";

import { useState, useEffect } from "react";
import InputSection from "../components/InputSection";
import OutputSection from "../components/OutputSection";
import LoadingState from "../components/LoadingState";
import { createClient } from "../../lib/supabase/client";
import "../globals.css";
import Hero from "../components/Hero";

export default function Home() {
  const [medicalNotes, setMedicalNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [dischargePlan, setDischargePlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmNoPII, setConfirmNoPII] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  // Copy states
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [dischargePlanCopied, setDischargePlanCopied] = useState(false);

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
      const dischargePlanText = summaryData.discharge_plan || ""; // Assuming API returns both
      
      setSummary(summaryText);
      setDischargePlan(dischargePlanText);

      // 5. Show output section and scroll to it
      setShowOutput(true);

    } catch (err) {
      alert("Unexpected error: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setMedicalNotes("");
    setSummary("");
    setDischargePlan("");
    setShowOutput(false);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary: ', err);
    }
  };

  const handleCopyDischargePlan = async () => {
    try {
      await navigator.clipboard.writeText(dischargePlan);
      setDischargePlanCopied(true);
      setTimeout(() => setDischargePlanCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy discharge plan: ', err);
    }
  };

  return (
    <div className="h-full flex flex-col pb-[5vw] px-[10vw]">
      {/* Hero Section - Only visible when not showing output */}
      {!showOutput && (
        <section className="px-6 py-6 flex-shrink-0">
          <Hero />
        </section>
      )}

      {/* Input Section - Only visible when not processing and not showing output */}
      {!isProcessing && !showOutput && (
        <section className="flex-1">
          <InputSection
            medicalNotes={medicalNotes}
            onNotesChange={(e) => setMedicalNotes(e.target.value)}
            onClear={handleClear}
            confirmNoPII={confirmNoPII}
            onConfirmNoPIIChange={setConfirmNoPII}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        </section>
      )}

      {/* Processing State - Only visible when processing */}
      {isProcessing && (
        <section className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6">
            <LoadingState />
          </div>
        </section>
      )}

      {/* Output Section - Only visible when showing output and not processing */}
      {showOutput && !isProcessing && (
        <section className="flex-1 flex flex-col">
          <div className="mb-6 px-6">
            <button
              onClick={() => setShowOutput(false)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Input
            </button>
          </div>
          <div className="flex-1 overflow-auto px-6 pb-8">
            <div className="max-w-6xl mx-auto">
              <OutputSection
                summary={summary}
                dischargePlan={dischargePlan}
                onSummaryChange={(e) => setSummary(e.target.value)}
                onDischargePlanChange={(e) => setDischargePlan(e.target.value)}
                onCopySummary={handleCopySummary}
                onCopyDischargePlan={handleCopyDischargePlan}
                summaryCopied={summaryCopied}
                dischargePlanCopied={dischargePlanCopied}
                isVisible={showOutput}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
