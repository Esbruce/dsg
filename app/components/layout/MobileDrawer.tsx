"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/login/actions";
import { useUserData } from "@/lib/hooks/useUserData";
import MobileSidebarContent from "./MobileSidebarContent";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  usageCount: number;
  maxUsage: number;
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isPaid: boolean;
  onGoUnlimited: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
  unlimitedActive?: boolean;
  referralProgress?: any;
  onSignInClick?: () => void;
  initialInviteMessage?: string;
};

export default function MobileDrawer({
  isOpen,
  onClose,
  usageCount,
  maxUsage,
  inviteLink,
  onCopyInviteLink,
  inviteLinkCopied,
  isPaid,
  onGoUnlimited,
  isAuthenticated,
  isLoading = false,
  unlimitedActive,
  referralProgress,
  onSignInClick,
  initialInviteMessage,
}: MobileDrawerProps) {
  const router = useRouter();
  const { refreshUserData } = useUserData();

  const handleLogout = async () => {
    try {
      await logout();
      await refreshUserData();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSignInFromFooter = () => {
    try {
      onClose();
    } catch {}
    onSignInClick?.();
  };
  return (
    <div
      className={`fixed inset-0 z-[10000] hide-at-1152 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-[90vw] max-w-sm bg-white shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-[10001] bg-white border-b border-[var(--color-neutral-300)] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="typography-button font-semibold text-[var(--color-neutral-900)]">Menu</span>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 text-[var(--color-neutral-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              aria-label="Close menu"
              title="Close"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
          <MobileSidebarContent
            usageCount={usageCount}
            maxUsage={maxUsage}
            isPaid={isPaid}
            unlimitedActive={unlimitedActive}
            unlimitedUntil={referralProgress?.unlimitedUntil || null}
            inviteLink={inviteLink}
            onCopyInviteLink={onCopyInviteLink}
            inviteLinkCopied={inviteLinkCopied}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            referralProgress={referralProgress}
            onSignInClick={() => {
              try { onClose(); } catch {}
              onSignInClick?.();
            }}
            onGoUnlimited={onGoUnlimited}
            initialInviteMessage={initialInviteMessage}
          />
        </div>

        {/* Auth Actions (Footer) */}
        <div className="p-4 flex-shrink-0 border-t border-[var(--color-neutral-300)] bg-white/60">
          {isLoading ? null : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          ) : (
            <button
              onClick={handleSignInFromFooter}
              className="w-full text-left px-3 py-2 text-sm text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


