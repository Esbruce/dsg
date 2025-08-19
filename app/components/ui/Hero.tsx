import React from "react";

export default function Hero() {
  return (
    <div className="text-center pt-2 pb-4 sm:py-6 md:py-12 px-3 sm:px-4">
      <div className="mb-0 sm:mb-3 flex justify-center">
        {/* <span className="inline-flex items-center rounded-full border border-[var(--color-primary-light)] bg-[color:rgba(6,190,190,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
          BETA
        </span> */}
      </div>
      <h1 className="text-[clamp(1.125rem,6vw,1.875rem)] md:text-4xl font-bold mb-2 sm:mb-4 md:mb-6 leading-tight text-[var(--color-neutral-900)]">
        Medical Notes to{" "}<br className="hidden md:block" /> 
        <span className="text-[var(--color-primary)]">
          Discharge Summary
        </span>{" "}
        in Seconds
      </h1>
      <p className="text-base sm:text-lg text-[var(--color-neutral-600)] max-w-2xl mx-auto">
        Made with doctors, for doctors.
      </p>
      
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-neutral-900)]">Lightning Fast</h3> */}
          {/* <p className="text-sm text-[var(--color-neutral-600)]">Generate summaries in seconds</p> */}
        {/* </div>

        <div className="flex flex-row items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-neutral-900)]">Secure & Private</h3> */}
          {/* <p className="text-sm text-[var(--color-neutral-600)]">Your data stays protected</p> */}
        {/* </div>

        <div className="flex flex-row items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-neutral-900)]">High Accuracy</h3> */}
          {/* <p className="text-sm text-[var(--color-neutral-600)]">Clinically validated results</p> */}
        {/* </div>
      </div> */}
    </div>
  );
}
