import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function redirectToCheckout(sessionId: string) {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return { success: false, error };
  }
} 