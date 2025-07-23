import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        // 🔒 SECURITY: Verify authenticated user from session
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use authenticated user's ID
        const authenticatedUserId = user.id;

        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', authenticatedUserId)
            .single();

        if (checkError && checkError.code === 'PGRST116') {
            // User doesn't exist
            return NextResponse.json({ exists: false });
        } else if (existingUser) {
            // User exists
            return NextResponse.json({ exists: true });
        } else {
            // Unexpected error
            return NextResponse.json({ error: checkError?.message || 'Unknown error' }, { status: 500 });
        }
    } catch (err: any) {
        console.error('Check user exists error:', err);
        return NextResponse.json({ 
            error: 'Failed to check user existence. Please try again.' 
        }, { status: 500 });
    }
} 