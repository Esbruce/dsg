import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
    try {
        // 🔒 SECURITY: Verify authenticated user from session
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('🔍 User status auth error:', authError);
            return NextResponse.json({ 
                error: 'Authentication failed', 
                details: authError.message 
            }, { status: 401 });
        }

        if (!user) {
            console.log('🔍 User status: No user found in session');
            return NextResponse.json({ 
                error: 'No authenticated user found' 
            }, { status: 401 });
        }

        console.log('🔍 User status: Authenticated user:', user.id);

        // Use authenticated user's ID (not from request body)
        const authenticatedUserId = user.id;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('daily_usage_count, last_used_at, is_paid')
            .eq('id', authenticatedUserId)
            .single();

        if (userError) {
            console.error('🔍 User status database error:', userError);
            return NextResponse.json({ 
                error: userError.message || 'User not found',
                details: 'Database query failed'
            }, { status: 404 });
        }

        if (!userData) {
            console.log('🔍 User status: No user data found for ID:', authenticatedUserId);
            return NextResponse.json({ 
                error: 'User data not found',
                details: 'User exists but no data in users table'
            }, { status: 404 });
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
        console.error('🔍 User status unexpected error:', err);
        return NextResponse.json({ 
            error: 'Failed to fetch user status. Please try again.',
            details: err.message
        }, { status: 500 });
    }
}



