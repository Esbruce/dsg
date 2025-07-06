"use client";

import { useState, useRef } from "react";
import InputSection from "../components/InputSection";
import OutputSection from "../components/OutputSection";
import CollapsedInputTab from "../components/CollapsedInputTab";
import LoadingState from "../components/LoadingState";
import { createClient } from "../../lib/supabase/client";
import "../globals.css";

export default function Home() {
  const [medicalNotes, setMedicalNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [dischargePlan, setDischargePlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmNoPII, setConfirmNoPII] = useState(false);
  
  // UI State
  const [showInputOnly, setShowInputOnly] = useState(true);
  const [inputCollapsed, setInputCollapsed] = useState(false);
  
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

      // 5. Update UI state - collapse input and show output
      setShowInputOnly(false);
      setInputCollapsed(true);

    } catch (err) {
      alert("Unexpected error: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
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

  const handleExpandInput = () => {
    setInputCollapsed(false);
  };

  const handleCollapseInput = () => {
    setInputCollapsed(true);
  };

  return (
    <div className="max-w-4xl mx-auto h-full">
          {/* Show input only on initial load */}
          {showInputOnly && (
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-full">
                
                <InputSection
                  medicalNotes={medicalNotes}
                  onNotesChange={(e) => setMedicalNotes(e.target.value)}
                  onClear={() => setMedicalNotes("")}
                  confirmNoPII={confirmNoPII}
                  onConfirmNoPIIChange={setConfirmNoPII}
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                  isCollapsed={inputCollapsed}
                  onCollapse={handleCollapseInput}
                />
              </div>
            </div>
          )}

          {/* Show collapsed input tab and output after processing */}
          {!showInputOnly && (
            <div className="py-8 h-full flex flex-col">
              {/* Collapsed Input Tab */}
              {inputCollapsed && (
                <CollapsedInputTab
                  onClick={handleExpandInput}
                  characterCount={medicalNotes.length}
                />
              )}

              {/* Expanded Input Section */}
              {!inputCollapsed && (
                <div className="mb-8">
                  <InputSection
                    medicalNotes={medicalNotes}
                    onNotesChange={(e) => setMedicalNotes(e.target.value)}
                    onClear={() => setMedicalNotes("")}
                    confirmNoPII={confirmNoPII}
                    onConfirmNoPIIChange={setConfirmNoPII}
                    onProcess={handleProcess}
                    isProcessing={isProcessing}
                    isCollapsed={inputCollapsed}
                    onCollapse={handleCollapseInput}
                  />
                </div>
              )}

              {/* Processing State */}
              {isProcessing && (
                <LoadingState />
              )}

              {/* Output Section */}
              {!isProcessing && (summary || dischargePlan) && (
                <div className="flex-1 flex flex-col">
                  <OutputSection
                    summary={summary}
                    dischargePlan={dischargePlan}
                    onSummaryChange={(e) => setSummary(e.target.value)}
                    onDischargePlanChange={(e) => setDischargePlan(e.target.value)}
                    onCopySummary={handleCopySummary}
                    onCopyDischargePlan={handleCopyDischargePlan}
                    summaryCopied={summaryCopied}
                    dischargePlanCopied={dischargePlanCopied}
                    isVisible={true}
                  />
                </div>
              )}
            </div>
          )}
    </div>
  );
}
