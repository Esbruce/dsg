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

    // Use authenticated user's ID (not from request body)
    const authenticatedUserId = user.id;

    // Get user's Stripe customer ID
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', authenticatedUserId)
      .single();

    if (error || !userData || !userData.stripe_customer_id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Customer portal error:', err);
    return NextResponse.json({ 
      error: 'Failed to create portal session. Please try again.' 
    }, { status: 500 });
  }
} 