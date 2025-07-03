import React, { useState } from "react";
import Image from "next/image";

function HeaderContent() {
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteLink = typeof window !== 'undefined' ? window.location.origin : '';
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <header className="w-full bg-white px-8 py-3 flex items-center justify-between shadow-sm max-w-7xl mx-auto rounded-2xl">
      {/* Left: Logo and Slogan */}
      <div className="flex items-center gap-6">
        <Image src="/dsg_logo.jpg" alt="DSG Logo" width={240} height={90} className="object-contain" priority />
        <span className="text-lg text-gray-800 font-medium whitespace-nowrap">Built by doctors. Powered by AI.</span>
        <div style={{ width: '180px' }} />
      </div>
      {/* Right: Navigation */}
      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-2">
          <a href="#about" className="text-base font-medium text-gray-800 transition-colors hover:text-[rgba(4,179,190,1)]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>About</a>
          <span className="ml-4 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.01c1.527-.878 3.286.88 2.408 2.408a1.724 1.724 0 0 0 1.01 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.01 2.573c.878 1.527-.88 3.286-2.408 2.408a1.724 1.724 0 0 0-2.573 1.01c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.01c-1.527.878-3.286-.88-2.408-2.408a1.724 1.724 0 0 0-1.01-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.01-2.573c-.878-1.527.88-3.286 2.408-2.408a1.724 1.724 0 0 0 2.573-1.01z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
            </svg>
          </span>
        </nav>
        {/* Invite Button and Subtext */}
        <div className="flex flex-col items-center ml-6 relative">
          <button
            className="bg-[rgba(4,179,190,1)] hover:bg-cyan-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors text-base transform transition-transform duration-150 hover:scale-105"
            onClick={() => setShowInvite((v) => !v)}
          >
            Invite your team
          </button>
          <span className="text-xs text-gray-500 mt-1 text-center">Work smarter together</span>
          {showInvite && (
            <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex flex-col items-center z-50 min-w-[260px]">
              <span className="text-xs text-gray-700 mb-2">Share this link with your team:</span>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-2 py-1 border border-gray-200 rounded-l bg-gray-50 text-xs text-gray-700 focus:outline-none"
                  style={{ minWidth: 0 }}
                />
                <button
                  onClick={handleCopy}
                  className="bg-[rgba(4,179,190,1)] hover:bg-cyan-600 text-white px-3 py-1 rounded-r text-xs font-medium transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <>
      <HeaderContent />
      {/* Three-phrase row below header */}
      <div className="w-full flex justify-center mt-4">
        <div className="flex flex-row gap-8 items-center">
          <span className="flex items-center text-base font-medium text-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Save time.
          </span>
          <span className="flex items-center text-base font-medium text-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Increase productivity.
          </span>
          <span className="flex items-center text-base font-medium text-gray-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="rgba(4,179,190,1)" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Secure and trusted.
          </span>
        </div>
      </div>
    </>
  );
} 