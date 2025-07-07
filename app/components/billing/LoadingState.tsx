export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-1)] via-[var(--color-bg-2)] to-[var(--color-bg-1)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full animate-pulse mx-auto mb-4"></div>
        <p className="text-gray-600">Loading billing information...</p>
      </div>
    </div>
  );
} 