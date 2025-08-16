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

        // Compute referral progress and unlimited info
        const { count: convertedCount } = await supabaseAdmin
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('referred_by', userId);

        // Progressive scheme (1,2,3). For progress display we still group by 3 for the main unlock rhythm
        const milestonesEarned = Math.min(convertedCount || 0, 3); // count within first 3 invites
        const invitesToNext = Math.max(0, 3 - ((convertedCount || 0) % 3));

        // Safety net: if they already have invites but no unlimited_until yet, award months now
        await ensureReferralAwards(userId, convertedCount || 0);

        const { data: unlimitedRow } = await supabaseAdmin
            .from('users')
            .select('unlimited_until, invite_message')
            .eq('id', userId)
            .single();

        return NextResponse.json({
            userStatus: userStatusData,
            referral: referralData,
            discount: discountData,
            referralProgress: {
                convertedCount: convertedCount || 0,
                milestonesEarned,
                invitesToNext: invitesToNext === 3 ? 0 : invitesToNext,
                unlimitedUntil: unlimitedRow?.unlimited_until || null
            },
            inviteMessage: unlimitedRow?.invite_message || null
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
        .select('daily_usage_count, last_used_at, is_paid, unlimited_until')
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

// Ensure progressive awards are granted for existing invite counts (idempotent)
async function ensureReferralAwards(userId: string, convertedCount: number) {
    try {
        if (convertedCount <= 0) return;

        const milestonesToHave = Math.min(convertedCount, 3);
        const { data: existing } = await supabaseAdmin
            .from('referral_milestones')
            .select('milestone_index')
            .eq('user_id', userId)
            .eq('milestone_size', 3);
        const granted = new Set((existing || []).map((m: any) => m.milestone_index));

        const windowStartIso = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const { data: inWindow } = await supabaseAdmin
            .from('referral_milestones')
            .select('granted_months, granted_at')
            .eq('user_id', userId)
            .gte('granted_at', windowStartIso);
        let monthsInWindow = (inWindow || []).reduce((s: number, r: any) => s + (r.granted_months || 0), 0);

        function addMonths(base: Date, months: number) {
            const d = new Date(base.getTime());
            d.setMonth(d.getMonth() + months);
            return d;
        }

        for (let idx = 1; idx <= milestonesToHave; idx++) {
            if (granted.has(idx)) continue;
            const proposed = idx; // 1,2,3
            const remaining = Math.max(0, 6 - monthsInWindow);
            const grantMonths = Math.min(proposed, remaining);
            if (grantMonths <= 0) break;

            const { data: userRow } = await supabaseAdmin
                .from('users')
                .select('unlimited_until')
                .eq('id', userId)
                .single();
            const baseDate = userRow?.unlimited_until ? new Date(userRow.unlimited_until as any) : new Date();
            const newUntil = addMonths(baseDate, grantMonths);

            await supabaseAdmin
                .from('users')
                .update({ unlimited_until: newUntil.toISOString() })
                .eq('id', userId);

            await supabaseAdmin
                .from('referral_milestones')
                .insert([{ user_id: userId, milestone_size: 3, milestone_index: idx, granted_months: grantMonths }]);

            monthsInWindow += grantMonths;
        }
    } catch {}
}
