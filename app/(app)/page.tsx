"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import InputSection from "../components/ui/generator/InputSection";
import OutputSection from "../components/ui/generator/OutputSection";
import LoadingState from "../components/ui/LoadingState";
import { useRequestIntent, ActionIntent } from "@/lib/hooks/useRequestIntent";

import "../globals.css";
import Hero from "../components/ui/Hero";
import Limit from "../components/overlays/Limit";
import { useUserData } from "../../lib/hooks/useUserData";
import {
  useLoginModal,
} from "../components/auth/LoginModal";
import LoginModal from "../components/auth/LoginModal";

export default function Home() {
  const [medicalNotes, setMedicalNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [dischargePlan, setDischargePlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmNoPII, setConfirmNoPII] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const autoProcessStartedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const handleProcessRef = useRef<(() => Promise<void>) | null>(null);

  // Get URL search params for checkout success handling
  const searchParams = useSearchParams();

  // Copy states
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [dischargePlanCopied, setDischargePlanCopied] = useState(false);

  // Rate limit state
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);

  // Get data and functions from context
  const { refreshUserData, isAuthenticated, isPaid, isLoading } = useUserData();
  
  // Keep ref in sync with isLoading state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  const { isInlineLoginModalOpen, hideInlineLoginModal } = useLoginModal();
  const { setRequestIntent, getRequestIntent, clearRequestIntent, intent } =
    useRequestIntent();
  const router = useRouter();

  const handleProcess = useCallback(async () => {
    if (!medicalNotes.trim()) {
      alert("Please enter medical notes to process");
      return;
    }

    if (!isAuthenticated) {
      // Preserve user intent and redirect to dedicated login page
      const intent = {
        type: "action" as const,
        name: "generate_summary",
        payload: { medicalNotes, confirmNoPII },
      };
      setRequestIntent(intent);
      // Persist a lightweight flag so we can show processing immediately after return
      try {
        sessionStorage.setItem("dsg_auth_processing", "1");
      } catch {}
      router.push('/login?returnTo=%2F');
      return;
    }

    // Ensure user data is fully loaded before processing (only check if not auto-processing)
    if (isLoading && !autoProcessStartedRef.current) {
      console.log("⏳ Waiting for user data to load before processing...");
      return;
    }

    console.log("🚀 Setting isProcessing to true...");
    setIsProcessing(true);

    try {
      // Helper to perform the request
      const request = async () =>
        fetch("/api/generate_summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ medical_notes: medicalNotes }), // No user_id needed - authenticated server-side
        });

      // Call generate-summary API (handles auth, quota, OpenAI, and DB insertion)
      let summaryRes = await request();

      // Transient 401 right after login: single silent retry after a short delay
      if (summaryRes.status === 401) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        summaryRes = await request();
      }

      if (!summaryRes.ok) {
        // Attempt to parse error payload for message; ignore failures
        let errorMessage: string | undefined;
        try {
          const errJson = await summaryRes.json();
          if (errJson && typeof errJson.error === 'string') {
            errorMessage = errJson.error;
          }
        } catch {}
        if (summaryRes.status === 403) {
          setShowLimitOverlay(true);
          setIsProcessing(false);
          return;
        }
        throw new Error(
          errorMessage || `Summary generation failed: ${summaryRes.status} ${summaryRes.statusText}`
        );
      }

      // Success path: parse JSON body
      const summaryData = await summaryRes.json();
      const summaryText = summaryData.summary || "";
      const dischargePlanText = summaryData.discharge_plan || ""; // Assuming API returns both

      console.log("📄 Setting summary and discharge plan...");
      setSummary(summaryText);
      setDischargePlan(dischargePlanText);

      // 4. Show output section and scroll to it
      console.log("📤 Setting showOutput to true...");
      setShowOutput(true);

      // 5. Refresh user data to update usage count in sidebar
      await refreshUserData();
    } catch (err) {
      console.error("❌ Processing error:", err);

      // Provide specific error messages based on error type
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes("Status check failed")) {
          errorMessage =
            "Unable to verify your account status. Please refresh the page and try again.";
        } else if (err.message.includes("Summary generation failed")) {
          errorMessage =
            "Failed to generate summary. Please check your medical notes and try again.";
        } else if (err.message.includes("Invalid response")) {
          errorMessage =
            "Received an invalid response from the server. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }

      alert(errorMessage);
    } finally {
      console.log("🏁 Setting isProcessing to false...");
      setIsProcessing(false);
    }
  }, [
    medicalNotes,
    isAuthenticated,
    refreshUserData,
    isLoading,
    setRequestIntent,
  ]);

  // Store the current handleProcess function in a ref
  useEffect(() => {
    handleProcessRef.current = handleProcess;
  }, [handleProcess]);

  // On mount, if we have an auth-processing flag from a pre-login redirect, show the preparing state immediately
  useEffect(() => {
    try {
      const flag = sessionStorage.getItem("dsg_auth_processing");
      if (flag === "1") {
        setIsAuthProcessing(true);
      }
    } catch {}
  }, []);

  // After login on a dedicated page, auto-run generation when returning with intent
  useEffect(() => {
    console.log("🔍 Auth effect triggered:", { isAuthenticated, isLoading });
    
    if (isAuthenticated && !autoProcessStartedRef.current) {
      const requestIntent = getRequestIntent();
      console.log("🎯 Retrieved intent:", requestIntent);
      
      if (
        requestIntent &&
        requestIntent.payload.type === "action" &&
        requestIntent.payload.name === "generate_summary"
      ) {
        console.log("📝 Found generate_summary intent, setting up auto-process...");
        const { payload } = requestIntent.payload as ActionIntent<{
          medicalNotes: string;
          confirmNoPII?: boolean;
        }>;
        
        if (payload && payload.medicalNotes) {
          setMedicalNotes(payload.medicalNotes);
          if (payload.confirmNoPII) {
            setConfirmNoPII(true);
          }
          autoProcessStartedRef.current = true;
          // Start processing almost immediately; avoid waiting on client-side user data
          setTimeout(() => {
            try {
              handleProcessRef.current?.();
            } catch (error) {
              console.error("❌ Error calling handleProcess:", error);
            }
            clearRequestIntent();
            autoProcessStartedRef.current = false;
          }, 100);
        }
      } else {
        // Authenticated but no valid intent; clear any stale preparing flag/state
        try {
          sessionStorage.removeItem("dsg_auth_processing");
        } catch {}
        setIsAuthProcessing(false);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    getRequestIntent,
    clearRequestIntent,
    intent,
  ]);

  // Once real processing begins, clear the temporary auth-processing flag and hide the preparing state
  useEffect(() => {
    if (isProcessing) {
      try {
        sessionStorage.removeItem("dsg_auth_processing");
      } catch {}
      setIsAuthProcessing(false);
    }
  }, [isProcessing]);

  // Safety timeout to avoid a stuck preparing state if the user abandons login or intent is missing
  useEffect(() => {
    if (isAuthProcessing && !isProcessing) {
      const timer = setTimeout(() => {
        try {
          sessionStorage.removeItem("dsg_auth_processing");
        } catch {}
        setIsAuthProcessing(false);
      }, 8000); // 8 seconds
      return () => clearTimeout(timer);
    }
  }, [isAuthProcessing, isProcessing]);

  // If unauthenticated and there is no intent, clear any stale preparing state quickly
  useEffect(() => {
    if (!isAuthenticated && isAuthProcessing) {
      const hasIntent = !!intent;
      if (!hasIntent) {
        try {
          sessionStorage.removeItem("dsg_auth_processing");
        } catch {}
        setIsAuthProcessing(false);
      }
    }
  }, [intent, isAuthenticated, isAuthProcessing]);
  // Handle checkout success - refresh user data and show success message
  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "success") {
      console.log("🎉 Checkout successful, refreshing user data...");

      // Use enhanced refresh function with built-in polling
      refreshUserData();

      // Show success message after a short delay
      setTimeout(() => {
        alert("Payment successful! Your subscription is now active.");
      }, 500);

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    } else if (checkoutStatus === "cancel") {
      console.log("❌ Checkout cancelled");

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, refreshUserData]);

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
      console.error("Failed to copy summary: ", err);
    }
  };

  const handleCopyDischargePlan = async () => {
    try {
      await navigator.clipboard.writeText(dischargePlan);
      setDischargePlanCopied(true);
      setTimeout(() => setDischargePlanCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy discharge plan: ", err);
    }
  };

  const handleUpgrade = async () => {
    try {
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}), // No user_id needed - authenticated server-side
      });

      if (!checkoutRes.ok) {
        throw new Error(
          `Checkout failed: ${checkoutRes.status} ${checkoutRes.statusText}`
        );
      }

      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("❌ Checkout error:", err);

      // Provide specific error messages based on error type
      let errorMessage = "Unable to start checkout process. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes("Checkout failed: 401")) {
          errorMessage = "Please sign in to upgrade your account.";
        } else if (err.message.includes("Checkout failed: 500")) {
          errorMessage =
            "Checkout service is temporarily unavailable. Please try again later.";
        } else if (err.message.includes("No checkout URL received")) {
          errorMessage = "Unable to create checkout session. Please try again.";
        } else {
          errorMessage = err.message;
        }
      }

      alert(errorMessage);
    }
  };

  const handleCloseLimitOverlay = () => {
    setShowLimitOverlay(false);
  };

  // Debug logging for UI states
  console.log("🎨 Render state:", { isProcessing, showOutput, isAuthProcessing, isInlineLoginModalOpen });
  
  return (
    <div className="h-full flex flex-col md:pb-[5vw] md:px-[10vw]">
      {showLimitOverlay ? (
        <section className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <Limit
              isVisible={true}
              onUpgrade={handleUpgrade}
              onClose={handleCloseLimitOverlay}
            />
          </div>
        </section>
      ) : (
        <>
          {/* Hero Section - Only visible when not showing output */}
          {!showOutput && !isProcessing && (
            <section className="px-4 sm:px-6 pt-2 pb-4 sm:py-6 flex-shrink-0">
              <Hero />
            </section>
          )}

          {/* Input Section or Login Modal - Only visible when not processing and not showing output */}
          {!isProcessing && !showOutput && !isAuthProcessing && (
            <section className="flex-1 px-4 pb-4 sm:px-6 sm:pb-6 md:px-0 md:pb-0">
              {isInlineLoginModalOpen ? (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] max-w-md w-full p-8">
                    <LoginModal onClose={hideInlineLoginModal} />
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

          {/* Auth Processing State - Only visible when processing authentication */}
          {isAuthProcessing && (
            <section className="w-full h-full flex-1 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">
                    Loading your account...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Preparing to generate your summary
                  </p>
                </div>
              </div>
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
              <div className="flex-1 overflow-auto px-4 pb-4">
                <div className="w-full max-w-7xl mx-auto">
                  <OutputSection
                    summary={summary}
                    dischargePlan={dischargePlan}
                    onSummaryChange={(e) => setSummary(e.target.value)}
                    onDischargePlanChange={(e) =>
                      setDischargePlan(e.target.value)
                    }
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
        </>
      )}
    </div>
  );
}
