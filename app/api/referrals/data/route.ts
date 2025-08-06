import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // For now, return mock data
    return NextResponse.json({
      referralLink: "https://example.com/referral/mock",
      hasBeenReferred: false,
      referrerInfo: null
    });
  } catch (error) {
    console.error('Referrals data error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
  }
} 