"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import InputSection from "../components/ui/generator/InputSection";
import OutputSection from "../components/ui/generator/OutputSection";
import LoadingState from "../components/ui/LoadingState";

import "../globals.css";
import Hero from "../components/ui/Hero";
import Limit from "../components/overlays/Limit";
import { useUserData } from "./layout";
import { useLoginModal, LoginModal } from "../components/auth";

export default function Home() {
  const [medicalNotes, setMedicalNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [dischargePlan, setDischargePlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmNoPII, setConfirmNoPII] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  // Get URL search params for checkout success handling
  const searchParams = useSearchParams();

  // Restore medical notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('temp_medical_notes');
    if (savedNotes) {
      setMedicalNotes(savedNotes);
      localStorage.removeItem('temp_medical_notes'); // Clean up after restoring
    }
  }, []);
  
  // Copy states
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [dischargePlanCopied, setDischargePlanCopied] = useState(false);
  
  // Rate limit state
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);
  
  // Get data and functions from context
  const { refreshUserData, isAuthenticated, isPaid } = useUserData();
  const { showInlineLoginModal, isInlineLoginModalOpen, hideInlineLoginModal } = useLoginModal();

  // Handle checkout success - refresh user data and show success message
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      console.log('🎉 Checkout successful, refreshing user data...');
      
      // Use enhanced refresh function with built-in polling
      refreshUserData();
      
      // Show success message after a short delay
      setTimeout(() => {
        alert('Payment successful! Your subscription is now active.');
      }, 500);
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
      
    } else if (checkoutStatus === 'cancel') {
      console.log('❌ Checkout cancelled');
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, refreshUserData]);

  // Handle authentication change - hide inline modal and auto-process
  useEffect(() => {
    if (isAuthenticated && isInlineLoginModalOpen) {
      console.log('🔄 User authenticated, hiding modal and starting auto-process...');
      hideInlineLoginModal();
      
      // Auto-process if user has medical notes (either in state or localStorage)
      const currentNotes = medicalNotes.trim() || localStorage.getItem('temp_medical_notes');
      if (currentNotes) {
        console.log('📝 Found medical notes, starting auto-process...');
        // Clean up localStorage if it was used
        localStorage.removeItem('temp_medical_notes');
        
        // Ensure notes are in state if they came from localStorage
        if (!medicalNotes.trim() && currentNotes) {
          setMedicalNotes(currentNotes);
        }
        
        // Small delay to ensure UI updates and state propagates
        setTimeout(() => {
          handleProcess();
        }, 500);
      } else {
        console.log('📝 No medical notes found for auto-processing');
      }
    }
  }, [isAuthenticated, isInlineLoginModalOpen]);

  const handleProcess = useCallback(async () => {
    if (!medicalNotes.trim()) {
      alert("Please enter medical notes to process");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save medical notes to localStorage before showing login modal
      localStorage.setItem('temp_medical_notes', medicalNotes);
      showInlineLoginModal();
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Check user status (server-side authenticated)
      const statusRes = await fetch("/api/user/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (!statusRes.ok) {
        throw new Error(`Status check failed: ${statusRes.status} ${statusRes.statusText}`);
      }

      // Parse status response and extract user information
      const { user: userStatus } = await statusRes.json();
      if (!userStatus) {
        throw new Error("Invalid response from status check");
      }

      // 2. Show limit overlay if over limit and not paid
      if (!userStatus.is_paid && userStatus.daily_usage_count >= 3) {
        setShowLimitOverlay(true);
        setIsProcessing(false);
        return;
      }

      // 3. Call generate-summary API (handles quota, OpenAI, and DB insertion)
      const summaryRes = await fetch("/api/generate_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medical_notes: medicalNotes }),  // No user_id needed - authenticated server-side
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

      // 4. Show output section and scroll to it
      setShowOutput(true);

      // 5. Refresh user data to update usage count in sidebar
      refreshUserData();

    } catch (err) {
      alert("Unexpected error: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, [medicalNotes, isAuthenticated, showInlineLoginModal, refreshUserData]);

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

  const handleUpgrade = async () => {
    try {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),  // No user_id needed - authenticated server-side
      });

      if (!checkoutRes.ok) {
        throw new Error(`Checkout failed: ${checkoutRes.status} ${checkoutRes.statusText}`);
      }

      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      alert("Error redirecting to checkout: " + (err as Error).message);
    }
  };

  const handleCloseLimitOverlay = () => {
    setShowLimitOverlay(false);
  };

  return (
    <div className="h-full flex flex-col pb-[5vw] px-[10vw]">
      {/* Rate Limit Overlay */}
      <Limit 
        isVisible={showLimitOverlay}
        onUpgrade={handleUpgrade}
        onClose={handleCloseLimitOverlay}
      />
      {/* Hero Section - Only visible when not showing output */}
      {!showOutput && !isProcessing && (
        <section className="px-6 py-6 flex-shrink-0">
          <Hero />
        </section>
      )}

      {/* Input Section or Login Modal - Only visible when not processing and not showing output */}
      {!isProcessing && !showOutput && (
        <section className="flex-1">
          {isInlineLoginModalOpen ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-xl shadow-lg border border-[var(--color-neutral-200)] max-w-md w-full p-8">
                        <LoginModal
          onClose={hideInlineLoginModal}
        />
              </div>
            </div>
          ) : (
            <InputSection
              medicalNotes={medicalNotes}
              onNotesChange={(e) => setMedicalNotes(e.target.value)}
              onClear={handleClear}
              confirmNoPII={confirmNoPII}
              onConfirmNoPIIChange={setConfirmNoPII}
              onProcess={handleProcess}
              isProcessing={isProcessing}
            />
          )}
        </section>
      )}

      {/* Processing State - Only visible when processing */}
      {isProcessing && (
        <section className=" w-full h-full flex-1 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <LoadingState />
          </div>
        </section>
      )}

      {/* Output Section - Only visible when showing output and not processing */}
      {showOutput && !isProcessing && (
        <section className="flex-1 flex flex-col">
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
                onBackToInput={() => setShowOutput(false)}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
