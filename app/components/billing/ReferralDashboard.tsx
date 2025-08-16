"use client";

import React, { useState } from 'react';
import { useUserData } from '@/lib/hooks/useUserData';

// Interface is now imported from the centralized hook

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const { referralData, referralProgress, unlimitedActive } = useUserData();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (!referralData) {
    return (
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Referral Program</h2>
      </div>

      {/* Unlimited status */}
      {unlimitedActive && referralProgress?.unlimitedUntil && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-green-800">Unlimited active</span>
          </div>
          <p className="text-sm text-green-700">Until <span className="font-medium">{new Date(referralProgress.unlimitedUntil).toLocaleDateString()}</span></p>
        </div>
      )}

      {/* Referral Link Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Invite Friends</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share your referral link. Rewards: invite 1 friend → +1 month; 2 friends → +3 months total; 3 friends → +6 months total (max 6 months/year).
        </p>
        
        <div className="flex items-center">
          <input
            type="text"
            value={referralData.referralLink}
            readOnly
            className="flex-1 px-3 py-2 border border-[var(--color-neutral-300)] rounded-l-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <button
            onClick={() => copyToClipboard(referralData.referralLink)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-r-lg hover:bg-[var(--color-primary-dark)] transition-colors text-sm font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {referralProgress && (
        <div className="pt-6 border-t border-[var(--color-neutral-200)]">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your progress</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">This round</span>
              <span className="text-sm text-gray-600">{(referralProgress.convertedCount % 3)}/3 invites</span>
            </div>
            <div className="flex items-center gap-2">
              {[0,1,2].map((i) => {
                const achieved = i < (referralProgress.convertedCount % 3);
                return (
                  <div key={i} className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${achieved ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white border-[var(--color-neutral-300)] text-[var(--color-neutral-600)]'}`}>
                    {achieved ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                    <span>Invite {i+1}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              {referralProgress.invitesToNext === 0
                ? (referralProgress.convertedCount > 0
                    ? '🎉 Milestone reached!'
                    : 'Invite more for more summaries.')
                : `${referralProgress.invitesToNext} more ${referralProgress.invitesToNext === 1 ? 'invite' : 'invites'} to unlock ${unlimitedActive ? '+3 months total (this tier)' : '+1/+2/+3 months across milestones'}`}
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-6 pt-6 border-t border-[var(--color-neutral-200)]">
        <h3 className="text-lg font-medium text-gray-900 mb-3">How it works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <p className="text-sm text-gray-600">
              Share your referral link with a friend (Invite 1 → +1 month)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <p className="text-sm text-gray-600">
              They sign up using your link (Invite 2 → +3 months total)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <p className="text-sm text-gray-600">
              Invite 3 → +6 months total (max 6 months/year)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 