import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { referralService } from '@/lib/referral/referral-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// GET method for testing checkout logic
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const test = searchParams.get('test');
    
    if (test === 'checkout-logic') {
      // Test the checkout logic without creating a session
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const authenticatedUserId = user.id;

      // Test discount status retrieval
      let discountStatus;
      try {
        discountStatus = await referralService.getReferrerDiscountStatus(authenticatedUserId);
      } catch (discountError) {
        discountStatus = { hasDiscount: false, discountPercentage: 0 };
      }

      // Test user data retrieval
      const { data: userData, error } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id, discounted')
        .eq('id', authenticatedUserId)
        .single();

      // Test pricing calculation
      const subscriptionPrice = parseInt(process.env.SUBSCRIPTION_PRICE_CENTS || '250');
      const originalPrice = subscriptionPrice / 100;
      const discountedPrice = discountStatus.hasDiscount ? originalPrice * (1 - discountStatus.discountPercentage / 100) : originalPrice;
      const unitAmount = Math.round(discountedPrice * 100);

      // Test customer balance retrieval
      let customerBalance = 0;
      if (userData?.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(userData.stripe_customer_id);
          if (customer && !customer.deleted) {
            customerBalance = customer.balance || 0;
          }
        } catch (balanceError) {
          console.error('Balance retrieval error:', balanceError);
        }
      }

      return NextResponse.json({
        status: 'Checkout logic test completed',
        data: {
          userId: authenticatedUserId,
          discountStatus,
          userData,
          pricing: {
            subscriptionPrice,
            originalPrice,
            discountedPrice,
            unitAmount,
            isValid: unitAmount > 0
          },
          customerBalance,
          environment: {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? 'present' : 'missing',
            SUBSCRIPTION_PRICE_CENTS: process.env.SUBSCRIPTION_PRICE_CENTS || '250'
          }
        }
      });
    }

    return NextResponse.json({ 
      message: 'Checkout endpoint is accessible',
      test_endpoints: {
        checkout_logic: '/api/stripe/checkout?test=checkout-logic'
      }
    });
  } catch (error) {
    console.error('Checkout test error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

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
    let discountStatus;
    try {
      discountStatus = await referralService.getReferrerDiscountStatus(authenticatedUserId);
      console.log('Discount status retrieved:', { userId: authenticatedUserId, discountStatus });
    } catch (discountError) {
      console.error('Error getting discount status:', discountError);
      // Fall back to no discount if there's an error
      discountStatus = { hasDiscount: false, discountPercentage: 0 };
    }
    
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
    
    // Validate discounted price is reasonable
    const unitAmount = Math.round(discountedPrice * 100);
    if (unitAmount <= 0) {
      console.error('Invalid unit amount calculated:', { discountedPrice, unitAmount, discountStatus });
      return NextResponse.json({ error: 'Invalid pricing calculation. Please contact support.' }, { status: 500 });
    }
    
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
      // Get customer balance if customer exists - with improved error handling
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted) {
          customerBalance = customer.balance || 0;
          console.log('Customer balance retrieved:', { customerId, balance: customerBalance });
        }
      } catch (balanceError) {
        console.error('Error retrieving customer balance:', balanceError);
        // Don't fail the checkout if balance retrieval fails
        customerBalance = 0;
      }
    }



    // Create checkout session with appropriate pricing
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // Use the price ID
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
      customer_update: {
        address: 'auto',
      },
    } as Stripe.Checkout.SessionCreateParams;

    // Add discount coupon if user has discount
    if (discountStatus.hasDiscount) {
      // Check if we already have a referral discount coupon
      let couponId = process.env.STRIPE_REFERRAL_COUPON_ID;
      
      if (!couponId) {
        // Create the coupon if it doesn't exist
        try {
          const coupon = await stripe.coupons.create({
            percent_off: discountStatus.discountPercentage,
            duration: 'forever',
            name: 'Referral Discount',
            metadata: {
              discount_type: 'referral',
              discount_percentage: discountStatus.discountPercentage.toString()
            }
          });
          couponId = coupon.id;
          console.log('Created referral discount coupon:', couponId);
        } catch (couponError) {
          console.error('Error creating coupon:', couponError);
          // Continue without discount if coupon creation fails
        }
      }
      
      if (couponId) {
        (sessionConfig as any).discounts = [{
          coupon: couponId
        }];
        console.log('Applied referral discount coupon:', couponId);
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      hasDiscount: discountStatus.hasDiscount,
      unitAmount,
      customerBalance,
      customerId
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
    
    // Provide more specific error messages
    if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        error: 'Invalid checkout request. Please try again or contact support.' 
      }, { status: 400 });
    }
    
    if (err.type === 'StripeCardError') {
      return NextResponse.json({ 
        error: 'Payment method error. Please check your card details.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Unable to create checkout session. Please try again.' 
    }, { status: 500 });
  }
}
