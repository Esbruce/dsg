import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '@/lib/referral/referral-service';

export async function POST(req: NextRequest) {
  try {
    const { referralUUID } = await req.json();

    if (!referralUUID) {
      return NextResponse.json({ 
        error: 'Referral UUID is required' 
      }, { status: 400 });
    }

    // Validate and get referrer ID
    const referrerId = await referralService.getReferrerFromUUID(referralUUID);

    if (!referrerId) {
      return NextResponse.json({ 
        valid: false,
        error: 'Invalid referral UUID' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true,
      referrerId 
    });
  } catch (error: any) {
    console.error('Error validating referral UUID:', error);
    return NextResponse.json({ 
      valid: false,
      error: error.message || 'Failed to validate referral UUID' 
    }, { status: 500 });
  }
} 