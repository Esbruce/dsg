import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { referralService } from '@/lib/referral/referral-service';

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

    // Sanity-check critical environment variables to avoid cryptic errors
    const missing: string[] = [];
    if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
    if (!process.env.NEXT_PUBLIC_BASE_URL) missing.push('NEXT_PUBLIC_BASE_URL');
    if (missing.length) {
      throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    }

    // Get user's discount status
    const discountStatus = await referralService.getReferrerDiscountStatus(authenticatedUserId);
    
    // Get user record for referral info
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, discounted')
      .eq('id', authenticatedUserId)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: error?.message || 'User not found' }, { status: 400 });
    }

    // Calculate pricing
    const subscriptionPrice = parseInt(process.env.SUBSCRIPTION_PRICE_CENTS || '250'); // Default to £2.50 (250 cents)
    const originalPrice = subscriptionPrice / 100; // Convert to pounds
    const discountedPrice = discountStatus.hasDiscount ? originalPrice * (1 - discountStatus.discountPercentage / 100) : originalPrice;
    
    // Create or get Stripe customer
    let customerId = userData.stripe_customer_id;
    let customerBalance = 0;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          user_id: authenticatedUserId,
        },
      });
      customerId = customer.id;
      
      // Update user record with Stripe customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', authenticatedUserId);
    } else {
      // Get customer balance if customer exists
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted) {
          customerBalance = customer.balance || 0;
        }
      } catch (balanceError) {
        console.error('Error retrieving customer balance:', balanceError);
      }
    }

    // Create checkout session with appropriate pricing
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: discountStatus.hasDiscount ? 'DSG Pro Subscription (50% Off)' : 'DSG Pro Subscription',
              description: discountStatus.hasDiscount 
                ? 'Unlimited medical note summaries - 50% referral discount applied!' 
                : 'Unlimited medical note summaries',
            },
            unit_amount: Math.round(discountedPrice * 100), // Use discounted price directly
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: authenticatedUserId,
        has_discount: discountStatus.hasDiscount.toString(),
        discount_percentage: discountStatus.discountPercentage.toString(),
        original_price: originalPrice.toString(),
        discounted_price: discountedPrice.toString(),
        customer_balance_cents: customerBalance.toString(),
        customer_balance_formatted: `£${(customerBalance / 100).toFixed(2)}`,
        subscription_price_cents: subscriptionPrice.toString(),
        savings_amount_cents: discountStatus.hasDiscount ? (subscriptionPrice * discountStatus.discountPercentage / 100).toString() : '0',
        savings_amount_formatted: discountStatus.hasDiscount ? `£${(subscriptionPrice * discountStatus.discountPercentage / 100 / 100).toFixed(2)}` : '£0.00',
        final_amount_after_balance: Math.max(0, (subscriptionPrice - customerBalance)).toString(),
        final_amount_after_balance_formatted: `£${Math.max(0, (subscriptionPrice - customerBalance) / 100).toFixed(2)}`,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?checkout=cancel`,
      // Add customer balance if user has discount
      ...(discountStatus.hasDiscount && {
        customer_update: {
          address: 'auto',
        },
        // Note: Customer balance will be applied automatically by Stripe
        // when the invoice is created, based on the balance we set earlier
      }),
    });

    return NextResponse.json({ 
      url: session.url,
      pricing: {
        originalPrice,
        discountedPrice,
        hasDiscount: discountStatus.hasDiscount,
        discountPercentage: discountStatus.discountPercentage,
        customerBalance: customerBalance / 100, // Convert to pounds
        customerBalanceFormatted: `£${(customerBalance / 100).toFixed(2)}`,
        finalAmountAfterBalance: Math.max(0, (subscriptionPrice - customerBalance) / 100),
        finalAmountAfterBalanceFormatted: `£${Math.max(0, (subscriptionPrice - customerBalance) / 100).toFixed(2)}`,
        savingsAmount: discountStatus.hasDiscount ? (subscriptionPrice * discountStatus.discountPercentage / 100 / 100) : 0,
        savingsAmountFormatted: discountStatus.hasDiscount ? `£${(subscriptionPrice * discountStatus.discountPercentage / 100 / 100).toFixed(2)}` : '£0.00'
      }
    });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Unable to create checkout session. Please try again.' }, { status: 500 });
  }
}
