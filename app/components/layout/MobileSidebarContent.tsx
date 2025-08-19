"use client";

import React from "react";
import Usage from "../ui/widgets/Usage";
import Invite from "../ui/widgets/Invite";
import { UsageSkeleton } from "../ui/widgets/UsageSkeleton";
import { InviteSkeleton } from "../ui/widgets/InviteSkeleton";

type MobileSidebarContentProps = {
  usageCount: number;
  maxUsage: number;
  isPaid: boolean;
  unlimitedActive?: boolean;
  unlimitedUntil?: string | null;
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isAuthenticated: boolean;
  isLoading?: boolean;
  referralProgress?: any;
  onSignInClick?: () => void;
  onGoUnlimited?: () => void;
  initialInviteMessage?: string;
};

export default function MobileSidebarContent({
  usageCount,
  maxUsage,
  isPaid,
  unlimitedActive = false,
  unlimitedUntil = null,
  inviteLink,
  onCopyInviteLink,
  inviteLinkCopied,
  isAuthenticated,
  isLoading = false,
  referralProgress,
  onSignInClick,
  onGoUnlimited,
  initialInviteMessage,
}: MobileSidebarContentProps) {
  const showSkeletons = isAuthenticated && isLoading;
  return (
    <div className="py-4 space-y-4 typography-body">
      {showSkeletons ? (
        <>
          <UsageSkeleton />
          <InviteSkeleton />
        </>
      ) : (
        <>
          <Usage
            usageCount={usageCount}
            maxUsage={maxUsage}
            isPaid={isPaid}
            unlimitedActive={unlimitedActive}
            unlimitedUntil={unlimitedUntil}
          />

          <Invite
            inviteLink={inviteLink}
            onCopyInviteLink={onCopyInviteLink}
            inviteLinkCopied={inviteLinkCopied}
            isAuthenticated={isAuthenticated}
            referralProgress={referralProgress}
            onSignInClick={onSignInClick}
            initialInviteMessage={initialInviteMessage}
          />

          {isAuthenticated && !isPaid && (
            <button
              onClick={onGoUnlimited}
              className="w-full mt-2 px-4 py-2 rounded-lg typography-button font-semibold bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700"
            >
              Go Unlimited
            </button>
          )}
        </>
      )}
    </div>
  );
}


