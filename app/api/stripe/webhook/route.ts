import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!userId) break;

      // Update user as paid
      await supabaseAdmin
        .from('users')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          is_paid: true,
        })
        .eq('id', userId);

      // Handle referral reward
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('referred_by')
        .eq('id', userId)
        .single();

      if (user?.referred_by) {
        const { data: inviter } = await supabaseAdmin
          .from('users')
          .select('stripe_customer_id')
          .eq('id', user.referred_by)
          .single();

        if (inviter?.stripe_customer_id) {
          // Reward inviter with a $5 credit
          await stripe.customers.update(inviter.stripe_customer_id, {
            balance: -299, // $5 credit in cents
          });

          await supabaseAdmin
            .from('users')
            .update({ has_referred_paid_user: true })
            .eq('id', user.referred_by);
        }
      }

      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Ensure user is marked as paid when subscription is created
      await supabaseAdmin
        .from('users')
        .update({ is_paid: true })
        .eq('stripe_customer_id', customerId);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabaseAdmin
        .from('users')
        .update({ is_paid: false })
        .eq('stripe_customer_id', customerId);

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Handle subscription status changes
      if (subscription.status === 'active') {
        // Subscription is active - user should have access
        await supabaseAdmin
          .from('users')
          .update({ is_paid: true })
          .eq('stripe_customer_id', customerId);
      } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
        // Subscription is cancelled, unpaid, or past due - revoke access
        await supabaseAdmin
          .from('users')
          .update({ is_paid: false })
          .eq('stripe_customer_id', customerId);
      }

      // Note: We don't change is_paid when cancel_at_period_end is true
      // because the user should keep access until the period actually ends
      // The customer.subscription.deleted event will handle the final cancellation

      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Ensure user access is restored when payment succeeds
      await supabaseAdmin
        .from('users')
        .update({ is_paid: true })
        .eq('stripe_customer_id', customerId);

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Revoke access when payment fails for any invoice
      // (This is safe since we're dealing with subscription-based service)
      await supabaseAdmin
        .from('users')
        .update({ is_paid: false })
        .eq('stripe_customer_id', customerId);

      break;
    }

    case 'invoice.created': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Check if user qualifies for recurring referral reward
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('has_referred_paid_user')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user?.has_referred_paid_user) {
        await stripe.customers.update(customerId, {
          balance: -500, // $5 credit
        });
      }

      break;
    }

    // Optional: handle more events as needed
  }

  return NextResponse.json({ received: true });
}
