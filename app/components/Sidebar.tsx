import React from "react";
import Image from "next/image";
import Usage from "./sidebar/Usage";
import Plan from "./sidebar/Plan";
import Invite from "./sidebar/Invite";
import SideNav from "./sidebar/SideNav";

type SidebarProps = {
  usageCount: number;
  maxUsage: number;
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isPaid: boolean;
  onGoUnlimited: () => void;
};

export default function Sidebar({ 
  usageCount, 
  maxUsage, 
  inviteLink, 
  onCopyInviteLink, 
  inviteLinkCopied,
  isPaid,
  onGoUnlimited
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-40 flex-col hidden lg:flex">
      {/* Branding */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 justify-center">
          <div>
            <h1 className="text-xl text-center font-bold text-gray-900">DSG</h1>
            <p className="text-sm text-gray-600">AI Medical Summary</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        <Usage 
          usageCount={usageCount}
          maxUsage={maxUsage}
          isPaid={isPaid}
        />

        <Plan 
          isPaid={isPaid}
          onGoUnlimited={onGoUnlimited}
        />

        <Invite 
          inviteLink={inviteLink}
          onCopyInviteLink={onCopyInviteLink}
          inviteLinkCopied={inviteLinkCopied}
        />
      </div>
    </aside>
  );
} 