"use client";

import React from "react";
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
        }`}
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

        <div className="h-[calc(100%-56px)] overflow-y-auto px-4 pb-[env(safe-area-inset-bottom)]">
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
            onSignInClick={onSignInClick}
            onGoUnlimited={onGoUnlimited}
            initialInviteMessage={initialInviteMessage}
          />
        </div>
      </div>
    </div>
  );
}


