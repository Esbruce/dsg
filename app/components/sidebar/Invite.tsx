import React from "react";

type InviteProps = {
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
};

export default function Invite({ inviteLink, onCopyInviteLink, inviteLinkCopied }: InviteProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <h3 className="text-sm font-medium text-gray-900">Invite Friends for 50% off</h3>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
        />
        <button
          onClick={onCopyInviteLink}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          {inviteLinkCopied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
} 