import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { referralService } from '@/lib/referral/referral-service';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const discountStatus = await referralService.getReferrerDiscountStatus(user.id);

    return NextResponse.json(discountStatus);
  } catch (error) {
    console.error('Error getting discount status:', error);
    return NextResponse.json({ error: 'Failed to get discount status' }, { status: 500 });
  }
} 