"use client";

import React from "react";
import Usage from "../ui/widgets/Usage";
import Plan from "../ui/widgets/Plan";
import Invite from "../ui/widgets/Invite";
import { UsageSkeleton } from "../ui/widgets/UsageSkeleton";
import { PlanSkeleton } from "../ui/widgets/PlanSkeleton";
import { InviteSkeleton } from "../ui/widgets/InviteSkeleton";
import { useRouter } from "next/navigation";
import { logout } from "@/app/login/actions";
import { useUserData } from "@/lib/hooks/useUserData";
import { useRequestIntent } from "@/lib/hooks/useRequestIntent";

type SidebarProps = {
  usageCount: number;
  maxUsage: number;
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isPaid: boolean;
  onGoUnlimited: () => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
};

export default function Sidebar({ 
  usageCount, 
  maxUsage, 
  inviteLink, 
  onCopyInviteLink, 
  inviteLinkCopied,
  isPaid,
  onGoUnlimited,
  isAuthenticated,
  isLoading = false
}: SidebarProps) {
  
  const showSkeletons = isAuthenticated && isLoading;
  const router = useRouter();
  const { refreshUserData } = useUserData();
  const { setRequestIntent } = useRequestIntent();

  const handleLogout = async () => {
    try {
      await logout();
      await refreshUserData();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSignInClick = () => {
    // Set default post-auth intent and navigate to dedicated login with returnTo
    setRequestIntent({ type: "navigate", path: "/" });
    const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    const encoded = encodeURIComponent(currentPath || "/");
    router.push(`/login?returnTo=${encoded}`);
  };

  return (
    <aside className="w-80 h-full bg-[var(--color-bg-5)] border-r border-[var(--color-neutral-300)] flex flex-col">
      {/* Branding */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 justify-center">
          <div>
            <h1 className="text-xl text-center font-bold text-gray-900">DSG</h1>
            <p className="text-sm text-gray-600">Discharge Summary Generator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {showSkeletons ? (
          <>
            <UsageSkeleton />
            <PlanSkeleton />
            <InviteSkeleton />
          </>
        ) : (
          <>
            <Usage 
              usageCount={usageCount}
              maxUsage={maxUsage}
              isPaid={isPaid}
            />
            <Plan 
              isPaid={isPaid}
              onGoUnlimited={onGoUnlimited}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
            {isAuthenticated && (
              <Invite 
                inviteLink={inviteLink}
                onCopyInviteLink={onCopyInviteLink}
                inviteLinkCopied={inviteLinkCopied}
              />
            )}
          </>
        )}
      </div>

      {/* Auth Actions */}
      <div className="p-6 flex-shrink-0">
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
            onClick={handleSignInClick}
            className="w-full text-left px-3 py-2 text-sm text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
