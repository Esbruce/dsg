import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET method for testing webhook connectivity
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const test = searchParams.get('test');
  
  if (test === 'checkout') {
    // Simulate a test checkout completion
    
    // Test Supabase connection and webhook database write
    try {
      // First, get an existing user to test with
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (fetchError || !users || users.length === 0) {
        return NextResponse.json({ 
          status: 'Test failed - no users found',
          error: fetchError?.message || 'No users in database',
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
      
      const testUserId = users[0].id;
      const testCustomerId = 'cus_test_' + Date.now();
      const testSubscriptionId = 'sub_test_' + Date.now();
      
      // Test the exact same database operation as the webhook
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          stripe_customer_id: testCustomerId,
          stripe_subscription_id: testSubscriptionId,
          is_paid: true,
        })
        .eq('id', testUserId);

      if (updateError) {
        return NextResponse.json({ 
          status: 'Test failed - database write error',
          error: updateError.message,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
      
      // Verify the update worked
      const { data: updatedUser, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id, stripe_subscription_id, is_paid')
        .eq('id', testUserId)
        .single();
      
      return NextResponse.json({ 
        status: 'Test successful - webhook database write working',
        timestamp: new Date().toISOString(),
        testData: {
          userId: testUserId,
          customerId: testCustomerId,
          subscriptionId: testSubscriptionId,
          updatedUser
        }
      });
      
    } catch (error) {
      return NextResponse.json({ 
        status: 'Test failed - unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
  
  if (test === 'env') {
    // Check environment variables
    const envVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing',
      STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID ? 'present' : 'missing',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ? 'present' : 'missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    };
    
    return NextResponse.json({ 
      status: 'Environment variables check',
      envVars,
      timestamp: new Date().toISOString()
    });
  }

  if (test === 'payment-flow') {
    // Test the entire payment flow
    
    try {
      // 1. Test database connection
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id, is_paid, stripe_customer_id, stripe_subscription_id')
        .limit(1);
      
      if (fetchError || !users || users.length === 0) {
        return NextResponse.json({ 
          status: 'Test failed - no users found',
          error: fetchError?.message || 'No users in database'
        }, { status: 500 });
      }
      
      const testUser = users[0];
      
      // 2. Simulate payment completion
      const testCustomerId = 'cus_test_' + Date.now();
      const testSubscriptionId = 'sub_test_' + Date.now();
      
      // 3. Update user as if payment completed
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          stripe_customer_id: testCustomerId,
          stripe_subscription_id: testSubscriptionId,
          is_paid: true,
        })
        .eq('id', testUser.id);

      if (updateError) {
        return NextResponse.json({ 
          status: 'Test failed - payment update failed',
          error: updateError.message
        }, { status: 500 });
      }
      
      // 4. Verify the update
      const { data: updatedUser, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('id, is_paid, stripe_customer_id, stripe_subscription_id')
        .eq('id', testUser.id)
        .single();
      
      if (verifyError) {
        return NextResponse.json({ 
          status: 'Test failed - verification failed',
          error: verifyError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        status: 'Payment flow test successful',
        before: testUser,
        after: updatedUser,
        paymentData: {
          customerId: testCustomerId,
          subscriptionId: testSubscriptionId
        }
      });
      
    } catch (error) {
      return NextResponse.json({ 
        status: 'Test failed - unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  if (test === 'clear-test-data') {
    // Clear test subscription data from database
    
    try {
      // Find users with test subscription IDs
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id, stripe_customer_id, stripe_subscription_id, is_paid')
        .or('stripe_customer_id.like.cus_test%,stripe_subscription_id.like.sub_test%');
      
      if (fetchError) {
        return NextResponse.json({ 
          status: 'Test failed - error fetching users',
          error: fetchError.message
        }, { status: 500 });
      }
      
      if (!users || users.length === 0) {
        return NextResponse.json({ 
          status: 'No test data found to clear'
        });
      }
      
      // Clear test data for all found users
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          stripe_customer_id: null,
          stripe_subscription_id: null,
          is_paid: false,
        })
        .or('stripe_customer_id.like.cus_test%,stripe_subscription_id.like.sub_test%');

      if (updateError) {
        return NextResponse.json({ 
          status: 'Test failed - error clearing test data',
          error: updateError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        status: 'Test data cleared successfully',
        clearedUsers: users.length,
        users: users
      });
      
    } catch (error) {
      return NextResponse.json({ 
        status: 'Test failed - unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  if (test === 'clear-balances') {
    // Clear customer balances from old discount system
    
    try {
      // Get all customers with negative balances
      const customers = await stripe.customers.list({
        limit: 100,
      });
      
      let clearedCount = 0;
      let totalCleared = 0;
      
      for (const customer of customers.data) {
        if (customer.balance && customer.balance < 0) {
          console.log(`Clearing balance for customer ${customer.id}: £${(customer.balance / 100).toFixed(2)}`);
          
          try {
            // Reset balance to 0
            await stripe.customers.update(customer.id, {
              balance: 0
            });
            
            clearedCount++;
            totalCleared += Math.abs(customer.balance);
          } catch (error) {
            console.error(`Failed to clear balance for customer ${customer.id}:`, error);
          }
        }
      }
      
      return NextResponse.json({ 
        status: 'Customer balances cleared',
        clearedCount,
        totalCleared: totalCleared / 100,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return NextResponse.json({ 
        status: 'Failed to clear balances',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
  
  return NextResponse.json({ 
    status: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    test_endpoints: {
      checkout: '/api/stripe/webhook?test=checkout',
      env: '/api/stripe/webhook?test=env',
      payment_flow: '/api/stripe/webhook?test=payment-flow',
      clear_test_data: '/api/stripe/webhook?test=clear-test-data'
    }
  });
}

export async function POST(req: NextRequest) {
  console.log('Webhook received:', new Date().toISOString());
  
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('Webhook signature verified, event type:', event.type);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          break;
        }

        // Update user as paid
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            is_paid: true,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Failed to update user payment status:', updateError);
        }

        // Handle referral conversion using new referral system
        try {
          const { referralService } = await import('@/lib/referral/referral-service');
          await referralService.convertReferral(userId);
        } catch (referralError) {
          console.error('Failed to process referral conversion:', referralError);
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Ensure user is marked as paid when subscription is created
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update user for subscription creation:', error);
        }

        // Apply referral discount to subscription if user has discount
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('discounted')
            .eq('stripe_customer_id', customerId)
            .single();

          if (user?.discounted) {
            // Check if we have a referral discount coupon
            let couponId = process.env.STRIPE_REFERRAL_COUPON_ID;
            
            if (!couponId) {
              // Create the coupon if it doesn't exist
              const coupon = await stripe.coupons.create({
                percent_off: 50, // 50% discount
                duration: 'forever',
                name: 'Referral Discount',
                metadata: {
                  discount_type: 'referral',
                  discount_percentage: '50'
                }
              });
              couponId = coupon.id;
              console.log('Created referral discount coupon for subscription:', couponId);
            }

            // Apply the coupon to the subscription
            await stripe.subscriptions.update(subscription.id, {
              // @ts-ignore - Stripe API accepts coupon parameter
              coupon: couponId
            });
            
            console.log('Applied referral discount coupon to subscription:', subscription.id);
          }
        } catch (discountError) {
          console.error('Failed to apply referral discount to subscription:', discountError);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: false })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update user for subscription deletion:', error);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Handle subscription status changes
        if (subscription.status === 'active') {
          // Subscription is active - user should have access
          const { error } = await supabaseAdmin
            .from('users')
            .update({ is_paid: true })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('Failed to update user for active subscription:', error);
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
          // Subscription is cancelled, unpaid, or past due - revoke access
          const { error } = await supabaseAdmin
            .from('users')
            .update({ is_paid: false })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('Failed to update user for inactive subscription:', error);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Ensure user access is restored when payment succeeds
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update user for successful payment:', error);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Revoke access when payment fails for any invoice
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: false })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update user for failed payment:', error);
        }

        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Note: No longer applying customer balance since we use coupons for permanent discounts
        // The discount is handled automatically by Stripe's coupon system
        console.log('Invoice created - discount handled by Stripe coupon system');

        break;
      }

      default:
        // Unhandled event type
        break;
    }

    console.log('Webhook processed successfully:', event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
