"use client";

import React, { useState, useEffect } from 'react';
import { useReferralDiscount } from '@/lib/hooks/useReferralDiscount';
import { useReferralData } from '@/lib/hooks/useReferralData';

// Interface is now imported from the centralized hook

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const { hasDiscount, discountPercentage } = useReferralDiscount();
  const referralData = useReferralData();

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

  // Loading and error states are handled by the context
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

  if (!referralData) {
    return (
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] p-6">
        <div className="text-center py-4">
          <p className="text-gray-600">No referral data available</p>
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

      {/* Discount Status */}
      {hasDiscount && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-green-800">Referral Discount Active!</span>
          </div>
          <p className="text-sm text-green-700">
            You're currently receiving a {discountPercentage}% discount on your subscription because you successfully referred a friend who signed up.
          </p>
        </div>
      )}

      {/* Referral Link Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Invite Friends</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share your referral link with friends. When they sign up, you'll get a permanent 50% discount on your subscription!
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

      {/* Friend Status */}
      {referralData.hasBeenReferred && referralData.referrerInfo && (
        <div className="pt-6 border-t border-[var(--color-neutral-200)]">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Your Referred Friend</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Friend joined</p>
                <p className="text-sm text-gray-600">
                  {formatDate(referralData.referrerInfo.createdAt)}
                </p>
              </div>
            </div>
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
              Share your referral link with a friend
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <p className="text-sm text-gray-600">
              They sign up using your link
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <p className="text-sm text-gray-600">
              You get a permanent 50% discount on your subscription!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 