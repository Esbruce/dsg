import React from "react";

type InviteProps = {
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
};

export default function Invite({ inviteLink, onCopyInviteLink, inviteLinkCopied }: InviteProps) {
  return (
    <div className="bg-[var(--color-neutral-50)] rounded-xl p-4 border border-[var(--color-neutral-300)] shadow-symmetric">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-sm font-medium text-[var(--color-neutral-900)]">Invite Friends for a 50% discount</h3>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 text-xs bg-white border border-[var(--color-neutral-300)] rounded-lg px-3 py-2 text-[var(--color-neutral-700)] w-1/2"
        />
        <button
          onClick={onCopyInviteLink}
          className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors text-xs font-medium"
        >
          {inviteLinkCopied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
} 