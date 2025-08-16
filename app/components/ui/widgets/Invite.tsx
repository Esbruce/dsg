import React, { useEffect, useMemo, useRef, useState } from "react";

type InviteProps = {
  inviteLink: string;
  onCopyInviteLink: () => void;
  inviteLinkCopied: boolean;
  isAuthenticated?: boolean;
  referralProgress?: {
    convertedCount: number;
    milestonesEarned: number;
    invitesToNext: number;
    unlimitedUntil: string | null;
  } | null;
  onSignInClick?: () => void;
  initialInviteMessage?: string;
};

export default function Invite({ inviteLink, onCopyInviteLink, inviteLinkCopied, isAuthenticated = false, referralProgress, onSignInClick, initialInviteMessage }: InviteProps) {
  const unlimitedActive = referralProgress?.unlimitedUntil ? new Date(referralProgress.unlimitedUntil) > new Date() : false;
  const unlimitedUntilText = referralProgress?.unlimitedUntil ? new Date(referralProgress.unlimitedUntil).toLocaleDateString() : null;
  const totalConverted = referralProgress?.convertedCount || 0;
  const rewardsUnlocked = Math.min(totalConverted, 3);
  const [beforeText, setBeforeText] = useState<string>("");
  const [afterText, setAfterText] = useState<string>("");
  const [messageCopied, setMessageCopied] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [showInviteEditor, setShowInviteEditor] = useState(false);
  const afterTaRef = useRef<HTMLTextAreaElement | null>(null);
  // Removed fragile contentEditable refs; using split editor (before/after textareas)

  // Default message template
  const defaultTemplate = "I’m using DSG to generate discharge summaries fast. Try it free — my link: [link]";

  // Canonical referral link for insertion and validation
  const canonicalLink = useMemo(() => withUtm(inviteLink, "copy"), [inviteLink]);
  const prettyLinkText = useMemo(() => {
    try {
      const u = new URL(canonicalLink);
      const host = u.host.replace(/^www\./, '');
      const path = u.pathname && u.pathname !== '/' ? u.pathname : '';
      const base = `${host}${path}`;
      return base.length > 28 ? base.slice(0, 25) + '…' : base;
    } catch {
      return 'your link';
    }
  }, [canonicalLink]);

  useEffect(() => {
    try {
      const saved = initialInviteMessage || localStorage.getItem("dsg_invite_message_template");
      const tmpl = saved && saved.trim().length > 0 ? saved : defaultTemplate;
      if (tmpl.includes("[link]")) {
        const [before, _after] = tmpl.split("[link]");
        setBeforeText((before || "").trimEnd());
        // Disallow trailing text after link
        setAfterText("");
      } else {
        setBeforeText(tmpl.trim());
        setAfterText("");
      }
    } catch {
      const [before, _after] = defaultTemplate.split("[link]");
      setBeforeText((before || "").trimEnd());
      setAfterText("");
    }
  }, [initialInviteMessage]);

  // Control visibility of after-text area
  useEffect(() => {
    setShowAfter((afterText || "").trim().length > 0);
  }, [afterText]);

  // Derive a template with [link] token for persistence
  const effectiveTemplate = useMemo(() => {
    const left = beforeText || "";
    const right = afterText || "";
    const spacerL = left.endsWith(" ") || left.length === 0 ? "" : " ";
    const spacerR = right.startsWith(" ") || right.length === 0 ? "" : " ";
    return `${left}${spacerL}[link]${spacerR}${right}`.trim();
  }, [beforeText, afterText]);

  useEffect(() => {
    try { localStorage.setItem("dsg_invite_message_template", effectiveTemplate); } catch {}
  }, [effectiveTemplate]);

  // Auto-save to server when parts change (debounced by browser scheduling naturally)
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          await fetch('/api/user/invite-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ invite_message: effectiveTemplate })
          });
        } catch {}
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [effectiveTemplate, isAuthenticated]);

  function withUtm(base: string, channel: string): string {
    try {
      const url = new URL(base);
      url.searchParams.set("utm_source", channel);
      url.searchParams.set("utm_medium", "referral");
      url.searchParams.set("utm_campaign", "invite_progressive");
      return url.toString();
    } catch {
      const joiner = base.includes("?") ? "&" : "?";
      return `${base}${joiner}utm_source=${encodeURIComponent(channel)}&utm_medium=referral&utm_campaign=invite_progressive`;
    }
  }

  function buildMessage(channel: string) {
    const linkForChannel = withUtm(inviteLink, channel);
    return effectiveTemplate.replace("[link]", linkForChannel);
  }

  // Removed preview: copy uses buildMessage("copy") directly

  // Save handler (tokenized)
  async function saveInviteTemplate() {
    const tokenized = effectiveTemplate; // already contains [link]
    try {
      localStorage.setItem("dsg_invite_message_template", tokenized);
    } catch {}
    try {
      await fetch('/api/user/invite-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invite_message: tokenized })
      })
    } catch {}
  }

  async function handleCopyMessage(channel: string) {
    try {
      const msg = buildMessage(channel);
      await navigator.clipboard.writeText(msg);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="bg-[var(--color-neutral-50)] rounded-lg p-3 border border-[var(--color-neutral-300)] space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--color-neutral-900)]">
            {unlimitedActive ? "Unlimited active" : "Invite friends for unlimited summaries"}
          </h3>
        </div>
        <div className="p-1.5 bg-[var(--color-neutral-100)] rounded-md flex-shrink-0">
          <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
      {unlimitedActive ? (
        <p className="text-xs text-[var(--color-neutral-600)] leading-snug break-words">Until <span className="font-medium">{unlimitedUntilText}</span></p>
      ) : (
        <ul className="text-[11px] text-[var(--color-neutral-600)] leading-snug space-y-0.5 list-disc list-inside">
          <li><span className="font-medium">Invite 1</span> → 1 month unlimited</li>
          <li><span className="font-medium">Invite 2</span> → 3 months unlimited</li>
          <li><span className="font-medium">Invite 3</span> → 6 months unlimited</li>
        </ul>
      )}


      {isAuthenticated ? (
        <div className="space-y-2">
          {referralProgress && (
            <div className="bg-white rounded-md border border-[var(--color-neutral-200)] p-2 space-y-2">

              {/* Milestone chips */}
              <div className="grid grid-cols-3 gap-1.5 w-full">
                {[0,1,2].map((i) => {
                  const achieved = i < rewardsUnlocked;
                  return (
                    <div key={i} className={`w-full px-2 py-0.5 rounded-full text-[10px] border flex items-center justify-center gap-1 ${achieved ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white border-[var(--color-neutral-300)] text-[var(--color-neutral-600)]'}`}>
                      {achieved ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        // Simple plus icon to suggest "add an invite"
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                        </svg>
                      )}
                      <span>Invite {i+1}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-[var(--color-neutral-700)] text-start font-medium">
                {referralProgress.invitesToNext === 0
                  ? (totalConverted > 0
                      ? '🎉 Milestone reached!'
                      : 'Invite more for more summaries.')
                  : (referralProgress.invitesToNext === 1 || referralProgress.invitesToNext === 2)
                    ? 'Invite more for more summaries.'
                    : `${referralProgress.invitesToNext} more ${referralProgress.invitesToNext === 1 ? 'invite' : 'invites'} to unlock ${rewardsUnlocked === 0 ? '+1 month' : rewardsUnlocked === 1 ? '+2 months (total 3)' : '+3 months (total 6)'}`}
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="space-y-2">
        <button
            onClick={onSignInClick}
            className="w-full px-3 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors text-xs font-medium"
          >
            Sign in to get your invite link
          </button>
        </div>
      )}

      {/* Invite message (compact dropdown editor) */}
      {isAuthenticated && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInviteEditor((v) => !v)}
              className="flex-1 flex items-center justify-between px-2 py-1.5 bg-white border border-[var(--color-neutral-300)] rounded-md text-xs text-[var(--color-neutral-800)] hover:bg-[var(--color-neutral-50)]"
              aria-expanded={showInviteEditor}
              aria-controls="invite-message-editor"
            >
              <span className="font-medium">Invite</span>
              <svg className={`w-4 h-4 transition-transform ${showInviteEditor ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => handleCopyMessage("copy")}
              className="px-2.5 py-1.5 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors text-xs"
              title="Copy invite message"
            >
              {messageCopied ? "Copied" : "Copy"}
            </button>
          </div>
          {showInviteEditor && (
            <div id="invite-message-editor" className="space-y-2">
              <textarea
                value={beforeText}
                onChange={(e) => setBeforeText(e.target.value)}
                className="w-full text-sm bg-white border border-[var(--color-neutral-300)] rounded-md px-2 py-2 text-[var(--color-neutral-800)]"
                placeholder={defaultTemplate.split('[link]')[0]?.trim() || ''}
                rows={2}
              />
              <div className="flex items-center justify-between gap-2">
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] max-w-full whitespace-nowrap overflow-hidden"
                  title="Referral link"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 11-5.656-5.656l1-1" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 010-5.656l2-2a4 4 0 115.656 5.656l-1 1" />
                  </svg>
                  <span className="font-mono text-[10px] overflow-hidden text-ellipsis">
                    {prettyLinkText}
                  </span>
                  <span className="sr-only">{canonicalLink}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-neutral-500)]">Edit your message. Link is included automatically.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 