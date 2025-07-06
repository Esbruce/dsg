import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
    
    const { user_id } = await req.json();

    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('daily_usage_count, last_used_at, is_paid')
        .eq('id', user_id)
        .single();

    if (userError || !user) {
        return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 404 });
    }

    // Apply daily reset logic (same as in generate_summary)
    const today = dayjs().format('YYYY-MM-DD');
    const lastUsedAt = user.last_used_at ? dayjs(user.last_used_at).format('YYYY-MM-DD') : null;

    if (lastUsedAt !== today) {
        // New day -> reset counter to 0
        await supabaseAdmin
            .from('users')
            .update({daily_usage_count: 0, last_used_at: today})
            .eq('id', user_id);
        
        // Return updated user data
        return NextResponse.json({ 
            user: {
                ...user,
                daily_usage_count: 0,
                last_used_at: today
            }
        });
    }

    return NextResponse.json({ user });
}



