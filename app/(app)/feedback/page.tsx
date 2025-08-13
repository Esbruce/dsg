"use client";

import React, { useState } from "react";
import { validateEmail } from "@/lib/utils/validation";
import TurnstileCaptcha from "@/app/components/auth/TurnstileCaptcha";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!message.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    if (email && !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    setCaptchaError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, captchaToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to submit feedback");
      }

      setSuccess("Thanks! Your feedback has been submitted.");
      setName("");
      setEmail("");
      setMessage("");
      setCaptchaToken(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaError = (msg: string) => {
    setCaptchaError(msg);
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-[var(--color-bg-1)] border border-[var(--color-neutral-300)] shadow-symmetric rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-[var(--color-neutral-200)]">
          <h1 className="text-2xl font-semibold text-gray-900">Feedback</h1>
          <p className="text-sm text-gray-600 mt-1">
            We’d love to hear your thoughts. We want to make writing discharge summary's as little a hassle as possible. This form is open to everyone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-800">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-800">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-800">
              Your feedback
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[140px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="What’s working well? What can we improve?"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-600 mb-2">Please complete the security check below</p>
            <TurnstileCaptcha
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              action="feedback_submit"
              className="flex justify-start"
              onVerify={(token) => { setCaptchaToken(token); setCaptchaError(null); }}
              onError={handleCaptchaError}
            />
            {captchaError && (
              <div className="mt-2 text-sm text-red-600">{captchaError}</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

