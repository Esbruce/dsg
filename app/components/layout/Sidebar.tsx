import React from "react";
import Image from "next/image";
import Usage from "../ui/widgets/Usage";
import Plan from "../ui/widgets/Plan";
import Invite from "../ui/widgets/Invite";
import SideNav from "./SideNav";

type SidebarProps = {
  usageCount: number;
  maxUsage: number;
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isPaid: boolean;
  onGoUnlimited: () => void;
  isAuthenticated: boolean;
};

export default function Sidebar({ 
  usageCount, 
  maxUsage, 
  inviteLink, 
  onCopyInviteLink, 
  inviteLinkCopied,
  isPaid,
  onGoUnlimited,
  isAuthenticated
}: SidebarProps) {
  return (
    <aside className="w-80 h-full bg-[var(--color-bg-4)] border-r border-[var(--color-neutral-300)] flex flex-col">
      {/* Branding */}
      <div className="p-6 border-b border-[var(--color-neutral-300)] flex-shrink-0">
        <div className="flex items-center gap-3 justify-center">
          <div>
            <h1 className="text-xl text-center font-bold text-gray-900">DSG</h1>
            <p className="text-sm text-gray-600">Discharge Summary Generator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <Usage 
          usageCount={usageCount}
          maxUsage={maxUsage}
          isPaid={isPaid}
        />

        <Plan 
          isPaid={isPaid}
          onGoUnlimited={onGoUnlimited}
          isAuthenticated={isAuthenticated}
        />

        {/* <Invite 
          inviteLink={inviteLink}
          onCopyInviteLink={onCopyInviteLink}
          inviteLinkCopied={inviteLinkCopied}
        /> */}
      </div>
    </aside>
  );
} 