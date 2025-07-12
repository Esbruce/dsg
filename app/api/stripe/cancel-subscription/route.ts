import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Verify authenticated user from session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse only non-sensitive data from request body
    const { cancel_immediately = false } = await req.json();

    // Use authenticated user's ID (not from request body)
    const authenticatedUserId = user.id;

    // Get user's subscription ID
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', authenticatedUserId)
      .single();

    if (error || !userData || !userData.stripe_subscription_id) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    let updatedSubscription;

    if (cancel_immediately) {
      // Cancel subscription immediately
      updatedSubscription = await stripe.subscriptions.cancel(userData.stripe_subscription_id);
    } else {
      // Cancel at period end (most common)
      updatedSubscription = await stripe.subscriptions.update(userData.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      canceledAt: updatedSubscription.canceled_at,
      currentPeriodEnd: (updatedSubscription as any).current_period_end,
    });
  } catch (err: any) {
    console.error('Subscription cancellation error:', err);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription. Please try again.' 
    }, { status: 500 });
  }
} 