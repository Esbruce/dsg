import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  // Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const details: string[] = [];

  try {
    // Read current Stripe identifiers
    const { data: userRow, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to load user billing data' }, { status: 500 });
    }

    const subscriptionId = userRow?.stripe_subscription_id as string | null;
    const customerId = userRow?.stripe_customer_id as string | null;

    // 1) Cancel Stripe subscription immediately if present
    if (subscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionId);
        details.push('Subscription canceled');
      } catch (err: any) {
        // If subscription is already canceled or missing, continue
        const code = err?.code || err?.raw?.code;
        if (code === 'resource_missing' || /No such subscription/i.test(err?.message || '')) {
          details.push('Subscription already canceled or not found');
        } else {
          console.error('Stripe subscription cancel failed:', err);
          return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 502 });
        }
      }
    }

    // 2) Attempt to delete Stripe customer (best-effort)
    if (customerId) {
      try {
        await stripe.customers.del(customerId);
        details.push('Customer deleted');
      } catch (err: any) {
        console.warn('Stripe customer delete failed (continuing):', err);
        details.push('Customer delete failed');
      }
    }

    // 3) Delete application data owned by the user
    try {
      // Delete user records
      await supabaseAdmin.from('records').delete().eq('user_id', userId);
      details.push('Records deleted');
    } catch (err: any) {
      console.error('Failed deleting records:', err);
      // Continue — account deletion should still proceed
      details.push('Records delete failed');
    }

    // 4) Delete row in users table
    try {
      await supabaseAdmin.from('users').delete().eq('id', userId);
      details.push('User row deleted');
    } catch (err: any) {
      console.error('Failed deleting user row:', err);
      return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
    }

    // 5) Delete Supabase auth user (invalidates session)
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      details.push('Auth user deleted');
    } catch (err: any) {
      console.error('Failed deleting auth user:', err);
      return NextResponse.json({ error: 'Failed to delete authentication user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, details });
  } catch (err: any) {
    console.error('Account deletion error:', err);
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 });
  }
}


