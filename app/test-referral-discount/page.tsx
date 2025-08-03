"use client";

import { useState } from 'react';
import { useReferralDiscount } from '@/lib/hooks/useReferralDiscount';

export default function TestReferralDiscount() {
  const { hasDiscount, discountPercentage, isLoading, error } = useReferralDiscount();
  const [testResult, setTestResult] = useState<any>(null);

  const testDiscountAPI = async () => {
    try {
      const response = await fetch('/api/referrals/discount-status');
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const testCheckoutAPI = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Referral Discount System Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hook Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">useReferralDiscount Hook</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Loading:</span>
                <span className={isLoading ? 'text-blue-600' : 'text-gray-600'}>
                  {isLoading ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Has Discount:</span>
                <span className={hasDiscount ? 'text-green-600' : 'text-gray-600'}>
                  {hasDiscount ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Discount Percentage:</span>
                <span className="text-gray-600">{discountPercentage}%</span>
              </div>
              
              {error && (
                <div className="flex justify-between">
                  <span className="font-medium text-red-600">Error:</span>
                  <span className="text-red-600">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* API Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            
            <div className="space-y-4">
              <button
                onClick={testDiscountAPI}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Discount Status API
              </button>
              
              <button
                onClick={testCheckoutAPI}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Checkout API
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Pricing Preview */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pricing Preview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Original Pricing */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Original Price</h3>
              <div className="text-2xl font-bold text-gray-900">£2.50</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>

            {/* Discounted Pricing */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">With Discount</h3>
              {hasDiscount ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-600">
                      £{(2.50 * (1 - discountPercentage / 100)).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">£2.50</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save £{(2.50 * (discountPercentage / 100)).toFixed(2)}/month!
                  </div>
                  <div className="text-xs text-gray-600">per month</div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-gray-900">£2.50</div>
                  <div className="text-sm text-gray-600">No discount applied</div>
                </div>
              )}
            </div>

            {/* Balance Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Customer Balance</h3>
              {testResult?.pricing ? (
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {testResult.pricing.customerBalanceFormatted}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Available Credit</div>
                  <div className="text-sm text-gray-600">
                    Final Amount: {testResult.pricing.finalAmountAfterBalanceFormatted}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-gray-400">£0.00</div>
                  <div className="text-sm text-gray-600">No balance info</div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Balance Breakdown */}
          {testResult?.pricing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Detailed Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Original Price:</span>
                  <div className="font-medium">£{testResult.pricing.originalPrice}</div>
                </div>
                <div>
                  <span className="text-gray-600">Discount:</span>
                  <div className="font-medium text-green-600">
                    {testResult.pricing.hasDiscount ? `${testResult.pricing.discountPercentage}%` : 'None'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Customer Balance:</span>
                  <div className="font-medium text-blue-600">{testResult.pricing.customerBalanceFormatted}</div>
                </div>
                <div>
                  <span className="text-gray-600">Final Amount:</span>
                  <div className="font-medium">{testResult.pricing.finalAmountAfterBalanceFormatted}</div>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Preview */}
          {testResult?.pricing && (
            <div className="mt-6 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-700">Stripe Checkout Preview</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium">
                      {testResult.pricing.hasDiscount 
                        ? 'DSG Pro Subscription (50% Off)' 
                        : 'DSG Pro Subscription'
                      }
                    </div>
                    <div className="text-gray-500 text-xs">
                      {testResult.pricing.hasDiscount 
                        ? 'Unlimited medical note summaries - 50% referral discount applied!' 
                        : 'Unlimited medical note summaries'
                      }
                    </div>
                  </div>
                  <div className="font-medium text-green-600">£{testResult.pricing.discountedPrice}</div>
                </div>
                
                {testResult.pricing.hasDiscount && (
                  <div className="text-xs text-green-600 text-center bg-green-50 p-2 rounded">
                    You're saving £{(testResult.pricing.originalPrice - testResult.pricing.discountedPrice).toFixed(2)}/month with your referral discount!
                  </div>
                )}
                
                <div className="text-xs text-gray-500 text-center">
                  Billed monthly • Cancel anytime
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 