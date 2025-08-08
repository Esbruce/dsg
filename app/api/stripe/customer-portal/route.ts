import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

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

    if (error || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure a Stripe customer exists for this user and belongs to the current Stripe env
    let customerId = userData.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id: authenticatedUserId },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', authenticatedUserId);
    } else {
      // Verify the customer exists in this Stripe environment; if not, recreate
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if ((existing as any)?.deleted) {
          throw new Error('Stripe customer marked as deleted');
        }
      } catch (verifyErr: any) {
        // If the customer doesn't exist in this environment/account, create a fresh one
        const shouldRecreate =
          verifyErr?.type === 'StripeInvalidRequestError' && verifyErr?.code === 'resource_missing';
        if (shouldRecreate || verifyErr?.message?.includes('No such customer')) {
          const newCustomer = await stripe.customers.create({
            metadata: { user_id: authenticatedUserId },
          });
          customerId = newCustomer.id;
          await supabaseAdmin
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', authenticatedUserId);
        } else {
          // Unknown verification error; bubble up to outer handler
          throw verifyErr;
        }
      }
    }

    // Build a robust return URL that works in all environments
    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin;

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Customer portal error:', {
      message: err?.message,
      type: err?.type,
      code: err?.code,
      raw: err,
    });
    if (err?.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: err.message || 'Invalid request to Stripe' }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to create portal session. Please try again.' 
    }, { status: 500 });
  }
} 