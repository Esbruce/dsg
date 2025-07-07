"use client";

import { useRouter } from "next/navigation";

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-1)] via-[var(--color-bg-2)] to-[var(--color-bg-1)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
} 