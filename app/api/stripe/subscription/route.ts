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

    // Get user's Stripe customer ID and subscription ID
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, is_paid')
      .eq('id', authenticatedUserId)
      .single();

    if (error || !userData) {
      console.error('❌ User not found in database:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 User data from database:', {
      userId: authenticatedUserId,
      isPaid: userData.is_paid,
      customerId: userData.stripe_customer_id,
      subscriptionId: userData.stripe_subscription_id
    });

    if (!userData.is_paid || !userData.stripe_customer_id || !userData.stripe_subscription_id) {
      console.log('❌ Missing required subscription data:', {
        isPaid: userData.is_paid,
        hasCustomerId: !!userData.stripe_customer_id,
        hasSubscriptionId: !!userData.stripe_subscription_id
      });
      return NextResponse.json({ 
        hasSubscription: false,
        message: 'No active subscription found'
      });
    }

    // Fetch subscription details from Stripe
    console.log('🔍 Fetching subscription from Stripe:', userData.stripe_subscription_id);
    const subscription = await stripe.subscriptions.retrieve(userData.stripe_subscription_id, {
      expand: ['default_payment_method', 'items.data.price']
    });
    console.log('✅ Subscription retrieved successfully:', subscription.id);

    // Fetch customer details for payment method info
    console.log('🔍 Fetching customer from Stripe:', userData.stripe_customer_id);
    const customer = await stripe.customers.retrieve(userData.stripe_customer_id) as Stripe.Customer;
    console.log('✅ Customer retrieved successfully:', customer.id);

    // Extract payment method details
    let paymentMethod = null;
    if (subscription.default_payment_method && typeof subscription.default_payment_method === 'object') {
      const pm = subscription.default_payment_method;
      if (pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year
        };
      }
    }

    // Extract subscription details
    const subscriptionData = {
      hasSubscription: true,
      status: subscription.status,
      currentPeriodEnd: subscription.items.data[0]?.current_period_end || (subscription as any).current_period_end,
      currentPeriodStart: subscription.items.data[0]?.current_period_start || (subscription as any).current_period_start,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at,
      price: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.items.data[0]?.price?.currency || 'gbp',
      interval: subscription.items.data[0]?.price?.recurring?.interval || 'month',
      paymentMethod,
      customerEmail: customer.email
    };

    return NextResponse.json(subscriptionData);
  } catch (err: any) {
    console.error('Subscription fetch error:', err);
    
    // Log more details about the error
    if (err.type) {
      console.error('Stripe error type:', err.type);
    }
    if (err.code) {
      console.error('Stripe error code:', err.code);
    }
    if (err.param) {
      console.error('Stripe error param:', err.param);
    }
    
    return NextResponse.json({ 
      error: err.message || 'Failed to fetch subscription details',
      stripeError: {
        type: err.type,
        code: err.code,
        param: err.param
      }
    }, { status: 500 });
  }
} 