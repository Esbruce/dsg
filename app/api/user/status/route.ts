import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    return NextResponse.json({ user });
}



