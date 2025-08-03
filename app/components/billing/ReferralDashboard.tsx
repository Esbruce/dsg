"use client";

import { useState, useEffect } from 'react';
import { useReferralDiscount } from '@/lib/hooks/useReferralDiscount';

interface ReferralData {
  referralLink: string;
  hasBeenReferred: boolean;
  referrerInfo?: {
    id: string;
    createdAt: string;
  };
}

export default function ReferralDashboard() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { hasDiscount, discountPercentage } = useReferralDiscount();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/data', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral data');
      }

      const result = await response.json();
      setReferralData(result.data);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
        <div className="text-center text-gray-500">
          <p>{error}</p>
          <button 
            onClick={fetchReferralData}
            className="mt-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-neutral-200)] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Referral System</h2>
        <p className="text-gray-600">Share your referral link with friends and colleagues!</p>
      </div>

      {/* Discount Status Section */}
      {hasDiscount && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Referral Discount Active!</p>
              <p className="text-sm text-green-600">
                You're getting {discountPercentage}% off your subscription
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Status */}
      {referralData.hasBeenReferred && referralData.referrerInfo && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">You were referred by a friend!</p>
              <p className="text-sm text-green-600">
                Referrer joined: {formatDate(referralData.referrerInfo.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Link Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Referral Link
        </label>
        <div className="flex">
          <input
            type="text"
            value={referralData.referralLink}
            readOnly
            className="flex-1 px-3 py-2 border border-[var(--color-neutral-300)] rounded-l-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <button
            onClick={() => copyToClipboard(referralData.referralLink)}
            className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-r-lg hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        {copied && (
          <p className="mt-1 text-sm text-[var(--color-success)]">Copied to clipboard!</p>
        )}
      </div>

      {/* How it works */}
      <div className="pt-6 border-t border-[var(--color-neutral-200)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Share your referral link with friends
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            When they sign up using your link, they're marked as your referral
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            When they upgrade to paid, you get 50% off your subscription!
          </div>
        </div>
      </div>
    </div>
  );
} 