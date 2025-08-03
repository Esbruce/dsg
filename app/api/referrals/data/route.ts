import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '@/lib/referral/referral-service';

export async function GET(req: NextRequest) {
  try {
    const referralData = await referralService.getCurrentUserReferralData();
    
    return NextResponse.json({ 
      success: true, 
      data: referralData 
    });
  } catch (error) {
    console.error('Error getting referral data:', error);
    return NextResponse.json({ 
      error: 'Failed to get referral data' 
    }, { status: 500 });
  }
} 