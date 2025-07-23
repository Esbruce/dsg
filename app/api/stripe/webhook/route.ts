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
    console.log('🧪 Test: Simulating checkout.session.completed event');
    
    // Test Supabase connection and webhook database write
    try {
      console.log('🧪 Test: Testing Supabase connection...');
      
      // First, get an existing user to test with
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (fetchError || !users || users.length === 0) {
        console.error('❌ Test: No users found:', fetchError);
        return NextResponse.json({ 
          status: 'Test failed - no users found',
          error: fetchError?.message || 'No users in database',
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
      
      const testUserId = users[0].id;
      const testCustomerId = 'cus_test_' + Date.now();
      const testSubscriptionId = 'sub_test_' + Date.now();
      
      console.log('🧪 Test: Testing webhook database write with user:', testUserId);
      
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
        console.error('❌ Test: Database write failed:', updateError);
        return NextResponse.json({ 
          status: 'Test failed - database write error',
          error: updateError.message,
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
      
      console.log('✅ Test: Database write successful');
      
      // Verify the update worked
      const { data: updatedUser, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id, stripe_subscription_id, is_paid')
        .eq('id', testUserId)
        .single();
      
      if (verifyError) {
        console.error('❌ Test: Verification failed:', verifyError);
      } else {
        console.log('✅ Test: Verification successful:', updatedUser);
      }
      
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
      console.error('❌ Test: Unexpected error:', error);
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
    console.log('🧪 Test: Testing complete payment flow...');
    
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
      console.log('🧪 Test: Found test user:', testUser);
      
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
      
      console.log('✅ Test: Payment flow test successful');
      
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
      console.error('❌ Test: Payment flow test failed:', error);
      return NextResponse.json({ 
        status: 'Test failed - unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  if (test === 'clear-test-data') {
    // Clear test subscription data from database
    console.log('🧪 Test: Clearing test subscription data...');
    
    try {
      // Find users with test subscription IDs
      const { data: users, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id, stripe_customer_id, stripe_subscription_id, is_paid')
        .or('stripe_customer_id.like.cus_test%,stripe_subscription_id.like.sub_test%');
      
      if (fetchError) {
        console.error('❌ Test: Error fetching users with test data:', fetchError);
        return NextResponse.json({ 
          status: 'Test failed - error fetching users',
          error: fetchError.message
        }, { status: 500 });
      }
      
      console.log('🧪 Test: Found users with test data:', users);
      
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
        console.error('❌ Test: Error clearing test data:', updateError);
        return NextResponse.json({ 
          status: 'Test failed - error clearing test data',
          error: updateError.message
        }, { status: 500 });
      }
      
      console.log('✅ Test: Test data cleared successfully');
      
      return NextResponse.json({ 
        status: 'Test data cleared successfully',
        clearedUsers: users.length,
        users: users
      });
      
    } catch (error) {
      console.error('❌ Test: Unexpected error:', error);
      return NextResponse.json({ 
        status: 'Test failed - unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
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
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  console.log('🔔 Webhook received:', { 
    signature: sig ? 'present' : 'missing',
    bodyLength: rawBody.length 
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💰 Checkout session completed:', { 
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId: session.metadata?.user_id
        });

        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('❌ No user_id in session metadata');
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
          console.error('❌ Failed to update user payment status:', updateError);
        } else {
          console.log('✅ User payment status updated successfully');
        }

        // Handle referral reward
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('referred_by')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error('❌ Failed to get user referral data:', userError);
        } else if (user?.referred_by) {
          console.log('🎁 Processing referral reward for user:', user.referred_by);
          
          const { data: inviter, error: inviterError } = await supabaseAdmin
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.referred_by)
            .single();

          if (inviterError) {
            console.error('❌ Failed to get inviter data:', inviterError);
          } else if (inviter?.stripe_customer_id) {
            try {
              // Reward inviter with a $5 credit
              await stripe.customers.update(inviter.stripe_customer_id, {
                balance: -299, // $5 credit in cents
              });

              await supabaseAdmin
                .from('users')
                .update({ has_referred_paid_user: true })
                .eq('id', user.referred_by);

              console.log('✅ Referral reward processed successfully');
            } catch (rewardError) {
              console.error('❌ Failed to process referral reward:', rewardError);
            }
          }
        }

        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log('📅 Subscription created:', { 
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status
        });

        // Ensure user is marked as paid when subscription is created
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('❌ Failed to update user for subscription creation:', error);
        } else {
          console.log('✅ User updated for subscription creation');
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log('❌ Subscription deleted:', { 
          subscriptionId: subscription.id,
          customerId
        });

        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: false })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('❌ Failed to update user for subscription deletion:', error);
        } else {
          console.log('✅ User updated for subscription deletion');
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log('🔄 Subscription updated:', { 
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status
        });

        // Handle subscription status changes
        if (subscription.status === 'active') {
          // Subscription is active - user should have access
          const { error } = await supabaseAdmin
            .from('users')
            .update({ is_paid: true })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('❌ Failed to update user for active subscription:', error);
          } else {
            console.log('✅ User updated for active subscription');
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
          // Subscription is cancelled, unpaid, or past due - revoke access
          const { error } = await supabaseAdmin
            .from('users')
            .update({ is_paid: false })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('❌ Failed to update user for inactive subscription:', error);
          } else {
            console.log('✅ User updated for inactive subscription');
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.log('💳 Payment succeeded:', { 
          invoiceId: invoice.id,
          customerId
        });

        // Ensure user access is restored when payment succeeds
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('❌ Failed to update user for successful payment:', error);
        } else {
          console.log('✅ User updated for successful payment');
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.log('💥 Payment failed:', { 
          invoiceId: invoice.id,
          customerId
        });

        // Revoke access when payment fails for any invoice
        const { error } = await supabaseAdmin
          .from('users')
          .update({ is_paid: false })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('❌ Failed to update user for failed payment:', error);
        } else {
          console.log('✅ User updated for failed payment');
        }

        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.log('📄 Invoice created:', { 
          invoiceId: invoice.id,
          customerId
        });

        // Check if user qualifies for recurring referral reward
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('has_referred_paid_user')
          .eq('stripe_customer_id', customerId)
          .single();

        if (error) {
          console.error('❌ Failed to check referral status:', error);
        } else if (user?.has_referred_paid_user) {
          try {
            await stripe.customers.update(customerId, {
              balance: -500, // $5 credit
            });
            console.log('✅ Recurring referral reward applied');
          } catch (rewardError) {
            console.error('❌ Failed to apply recurring referral reward:', rewardError);
          }
        }

        break;
      }

      default:
        console.log('ℹ️ Unhandled webhook event type:', event.type);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
