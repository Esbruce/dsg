import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    // Sanity-check critical environment variables to avoid cryptic errors
    const missing: string[] = [];
    if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
    if (!process.env.STRIPE_PRICE_ID) missing.push('STRIPE_PRICE_ID');
    if (!process.env.NEXT_PUBLIC_BASE_URL) missing.push('NEXT_PUBLIC_BASE_URL');
    if (missing.length) {
      throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    }

    // Get user record
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('referred_by')
      .eq('id', user_id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: error?.message || 'User not found' }, { status: 400 });
    }

    // Check for referral discount
    let coupon;
    if (user.referred_by && process.env.STRIPE_REFERRAL_COUPON_ID) {
      coupon = process.env.STRIPE_REFERRAL_COUPON_ID;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        user_id,
      },
      discounts: coupon ? [{ coupon }] : undefined,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
