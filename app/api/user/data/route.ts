import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { referralService } from '@/lib/referral/referral-service';
import dayjs from 'dayjs';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        const userId = user.id;

        const [userStatusData, referralData, discountData] = await Promise.all([
            getUserStatus(userId),
            referralService.getReferralData(userId),
            referralService.getReferrerDiscountStatus(userId)
        ]);

        return NextResponse.json({
            userStatus: userStatusData,
            referral: referralData,
            discount: discountData
        });
    } catch (err: any) {
        console.error('🔍 Combined user data error:', err);
        return NextResponse.json({
            error: 'Failed to fetch user data. Please try again.',
            details: err.message
        }, { status: 500 });
    }
}

async function getUserStatus(userId: string) {
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('daily_usage_count, last_used_at, is_paid')
        .eq('id', userId)
        .single();

    if (userError) {
        console.error('🔍 User status database error:', userError);
        throw new Error('User not found');
    }

    if (!userData) {
        throw new Error('User data not found');
    }

    const today = dayjs().format('YYYY-MM-DD');
    const lastUsedAt = userData.last_used_at ? dayjs(userData.last_used_at).format('YYYY-MM-DD') : null;

    if (lastUsedAt !== today) {
        await supabaseAdmin
            .from('users')
            .update({ daily_usage_count: 0, last_used_at: today })
            .eq('id', userId);
        
        return {
            ...userData,
            daily_usage_count: 0,
            last_used_at: today
        };
    }

    return userData;
}
