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
      console.log('❌ Create user: Unauthorized - no valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse only non-sensitive data from request body
    const { referred_by } = await req.json();

    // Use authenticated user's ID (not from request body)
    const authenticatedUserId = user.id;

    console.log('🔍 Create user: Checking if user exists in database:', authenticatedUserId);

    // Check if user already exists in the users table
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authenticatedUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Create user: Database error checking existing user:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingUser) {
      console.log('✅ Create user: User already exists in database, updating referral if allowed');
      // Write-once referral semantics and self-referral guard
      if (referred_by && referred_by !== authenticatedUserId) {
        // Only set referral if currently null
        const { data: currentUser } = await supabaseAdmin
          .from('users')
          .select('referred_by')
          .eq('id', authenticatedUserId)
          .single();

        if (!currentUser?.referred_by) {
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ referred_by })
            .eq('id', authenticatedUserId);

          if (updateError) {
            console.error('❌ Create user: Error updating user referral:', updateError);
            return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
          }
          console.log('✅ Create user: Set referral for existing user:', { userId: authenticatedUserId, referred_by });
        }
      }
      
      return NextResponse.json({ success: true, message: 'User already exists' });
    }

    console.log('📝 Create user: Creating new user record in database:', { userId: authenticatedUserId, referred_by });

    // Create new user record
    const safeReferral = referred_by && referred_by !== authenticatedUserId ? referred_by : null;
    const { error } = await supabaseAdmin
      .from('users')
      .insert([{ id: authenticatedUserId, referred_by: safeReferral }]);

    if (error) {
      console.error('❌ Create user: Error creating user record:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Create user: User created successfully with referral:', { userId: authenticatedUserId, referred_by });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Create user: Unexpected error:', err);
    return NextResponse.json({ 
      error: 'Failed to create user. Please try again.' 
    }, { status: 500 });
  }
}

