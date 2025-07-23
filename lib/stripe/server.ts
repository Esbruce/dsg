import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export function validateStripeConfig() {
  const missing = [];
  if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
  if (!process.env.STRIPE_PRICE_ID) missing.push('STRIPE_PRICE_ID');
  if (!process.env.NEXT_PUBLIC_BASE_URL) missing.push('NEXT_PUBLIC_BASE_URL');
  
  if (missing.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
  }
} 