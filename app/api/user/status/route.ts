import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
    try {
        // 🔒 SECURITY: Verify authenticated user from session
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use authenticated user's ID (not from request body)
        const authenticatedUserId = user.id;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('daily_usage_count, last_used_at, is_paid')
            .eq('id', authenticatedUserId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 404 });
        }

        // Apply daily reset logic (same as in generate_summary)
        const today = dayjs().format('YYYY-MM-DD');
        const lastUsedAt = userData.last_used_at ? dayjs(userData.last_used_at).format('YYYY-MM-DD') : null;

        if (lastUsedAt !== today) {
            // New day -> reset counter to 0
            await supabaseAdmin
                .from('users')
                .update({daily_usage_count: 0, last_used_at: today})
                .eq('id', authenticatedUserId);
            
            // Return updated user data
            return NextResponse.json({ 
                user: {
                    ...userData,
                    daily_usage_count: 0,
                    last_used_at: today
                }
            });
        }

        return NextResponse.json({ user: userData });
    } catch (err: any) {
        console.error('User status error:', err);
        return NextResponse.json({ 
            error: err.message || 'Failed to fetch user status' 
        }, { status: 500 });
    }
}



