// /app/api/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
// Referral rewards handled in-app by awarding unlimited months based on referrals

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
          // Award referral months to referrer using progressive scheme (1,2,3 months)
          try {
            await awardReferralMilestones(referred_by);
          } catch (grantError) {
            console.error('❌ Create user: Error awarding referral months on signup:', grantError);
          }
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

    // If referred_by is present, award referral months immediately
    if (safeReferral) {
      try {
        await awardReferralMilestones(safeReferral);
      } catch (grantError) {
        console.error('❌ Create user: Error awarding referral months on signup (new user):', grantError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Create user: Unexpected error:', err);
    return NextResponse.json({ 
      error: 'Failed to create user. Please try again.' 
    }, { status: 500 });
  }
}

/**
 * Award referral months using progressive scheme:
 * - 1st invite → +1 month
 * - 2nd invite → +2 months (total 3)
 * - 3rd invite → +3 months (total 6)
 * Cap: 6 months within a rolling 12 months window.
 */
async function awardReferralMilestones(referrerId: string) {
  // How many users has this referrer brought in?
  const { count: referredCount, error: countError } = await supabaseAdmin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', referrerId);

  if (countError) {
    console.error('awardReferralMilestones: count error', countError);
    return;
  }

  const total = referredCount || 0;
  // We only award the first three milestones in this scheme
  const milestonesEarned = Math.min(total, 3);

  // Fetch existing milestones to avoid double-granting
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('referral_milestones')
    .select('milestone_index, granted_months, granted_at')
    .eq('user_id', referrerId)
    .eq('milestone_size', 3) // reuse size=3 to group this campaign
    .order('milestone_index', { ascending: true });
  if (existingError) {
    console.error('awardReferralMilestones: fetch existing error', existingError);
    return;
  }
  const grantedIndexes = new Set((existing || []).map((m: any) => m.milestone_index));

  // Compute cap usage in last 12 months
  const windowStartIso = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  const { data: inWindow, error: windowError } = await supabaseAdmin
    .from('referral_milestones')
    .select('granted_months, granted_at')
    .eq('user_id', referrerId)
    .gte('granted_at', windowStartIso);
  if (windowError) {
    console.error('awardReferralMilestones: window fetch error', windowError);
    return;
  }
  let monthsGrantedInWindow = (inWindow || []).reduce((sum: number, row: any) => sum + (row.granted_months || 0), 0);

  // Helper add months
  function addMonths(base: Date, months: number): Date {
    const d = new Date(base.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  for (let idx = 1; idx <= milestonesEarned; idx++) {
    if (grantedIndexes.has(idx)) continue; // already granted

    // Progressive grant: 1, then 2, then 3 months
    const proposedMonths = idx; 
    const remainingCap = Math.max(0, 6 - monthsGrantedInWindow);
    const grantMonths = Math.min(proposedMonths, remainingCap);
    if (grantMonths <= 0) break;

    // Read current unlimited_until
    const { data: refUser, error: refUserError } = await supabaseAdmin
      .from('users')
      .select('unlimited_until')
      .eq('id', referrerId)
      .single();
    if (refUserError) {
      console.error('awardReferralMilestones: user fetch error', refUserError);
      return;
    }

    const baseDate = refUser?.unlimited_until ? new Date(refUser.unlimited_until as any) : new Date();
    const newUntil = addMonths(baseDate, grantMonths);

    // Update user
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({ unlimited_until: newUntil.toISOString() })
      .eq('id', referrerId);
    if (updateUserError) {
      console.error('awardReferralMilestones: update user error', updateUserError);
      return;
    }

    // Insert milestone
    const { error: insertError } = await supabaseAdmin
      .from('referral_milestones')
      .insert([{ user_id: referrerId, milestone_size: 3, milestone_index: idx, granted_months: grantMonths }]);
    if (insertError) {
      console.error('awardReferralMilestones: insert milestone error', insertError);
    }

    monthsGrantedInWindow += grantMonths;
  }
}

