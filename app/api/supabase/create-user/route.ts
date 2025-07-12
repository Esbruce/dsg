// /app/api/create-user/route.ts
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

    // Parse only non-sensitive data from request body
    const { referred_by } = await req.json();

    // Use authenticated user's ID (not from request body)
    const authenticatedUserId = user.id;

    const { error } = await supabaseAdmin
      .from('users')
      .insert([{ id: authenticatedUserId, referred_by }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json({ 
      error: 'Failed to create user. Please try again.' 
    }, { status: 500 });
  }
}

