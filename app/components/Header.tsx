import React from "react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-b from-[var(--color-bg-2)] via-[var(--color-bg-2)] to-transparent p-5">
      <div className=" flex items-center justify-end gap-6">
        <nav className="flex items-center gap-10">
          <button className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors font-medium">
            Billing
          </button>
          <button className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors font-medium">
            Feedback
          </button>
          <button className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors font-medium">
            About
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-[var(--color-neutral-800)] hover:text-[var(--color-neutral-600)] transition-colors"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}



