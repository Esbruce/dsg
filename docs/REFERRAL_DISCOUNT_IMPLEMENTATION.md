# Referral Discount System Implementation

## Overview

This document outlines the implementation of the referral discount system that provides referrers with a 50% discount on their subscription when they have referred at least 3 friends who upgraded to a paid plan.

## Database Schema

### Users Table Changes

Added a new `discounted` boolean column to the `users` table:

```sql
ALTER TABLE public.users ADD COLUMN discounted BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN public.users.discounted IS 'Whether the user has a referral discount applied';
```

### Existing Columns Used

- `referred_by`: UUID of the user who referred this user
- `has_reffered_paid_user`: Boolean flag indicating if the user has referred a paid user

## Backend Implementation

### ReferralService Enhancements

The `lib/referral/referral-service.ts` file has been enhanced with three new methods:

#### 1. `convertReferral(referredUserId: string)`

Called when a referred user completes payment. This method:
- Finds the referrer using the `referred_by` field
- Updates the referrer's `has_reffered_paid_user` and `discounted` flags to `true`
- Calls `applyReferralReward` to add balance to the referrer's Stripe account

#### 2. `applyReferralReward(referrerId: string)`

Applies the referral reward by:
- Getting the referrer's Stripe customer ID
- Calculating the reward (50% of subscription price)
- Adding the reward as a negative balance (credit) to the Stripe customer

#### 3. `getReferrerDiscountStatus(userId: string)`

Returns the discount status for the frontend:
- `hasDiscount`: Boolean indicating if user has discount
- `discountPercentage`: Always 50 when discount is active

### Stripe Webhook Integration

The `app/api/stripe/webhook/route.ts` already calls `referralService.convertReferral(userId)` when a `checkout.session.completed` event occurs.

### API Endpoints

#### New: `/api/referrals/discount-status`

Returns the current user's discount status:
```typescript
{
  hasDiscount: boolean;
  discountPercentage: number;
}
```

#### Enhanced: `/api/stripe/checkout`

The checkout endpoint now includes comprehensive balance and pricing metadata:

**Request:** `POST /api/stripe/checkout`

**Response:**
```typescript
{
  url: string; // Stripe checkout URL
  pricing: {
    originalPrice: number;
    discountedPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
    customerBalance: number; // In pounds
    customerBalanceFormatted: string; // e.g., "£10.00"
    finalAmountAfterBalance: number; // Amount after balance is applied
    finalAmountAfterBalanceFormatted: string; // e.g., "£10.00"
    savingsAmount: number; // Discount amount in pounds
    savingsAmountFormatted: string; // e.g., "£10.00"
  }
}
```

**Stripe Session Metadata:**
The checkout session includes detailed metadata for tracking:
- `user_id`: User's UUID
- `has_discount`: Whether user has referral discount
- `discount_percentage`: Discount percentage (50)
- `original_price`: Original subscription price
- `discounted_price`: Price after discount
- `customer_balance_cents`: Customer balance in cents
- `customer_balance_formatted`: Formatted balance (e.g., "£10.00")
- `subscription_price_cents`: Subscription price in cents
- `savings_amount_cents`: Savings amount in cents
- `savings_amount_formatted`: Formatted savings
- `final_amount_after_balance`: Final amount after balance
- `final_amount_after_balance_formatted`: Formatted final amount

## Frontend Implementation

### React Hook: `useReferralDiscount`

Located in `lib/hooks/useReferralDiscount.ts`, this hook:
- Fetches discount status from the API
- Provides loading and error states
- Returns discount information for components

### Component Updates

#### UpgradeCard Component

Updated `app/components/billing/UpgradeCard.tsx` to:
- Show a green discount badge when discount is active
- Display discounted price with strikethrough original price
- Show savings amount
- Disable button during loading

#### ReferralDashboard Component

Updated `app/components/billing/ReferralDashboard.tsx` to:
- Display active discount status with green badge
- Show discount percentage
- Maintain existing referral link functionality

## Environment Variables

### Required

- `STRIPE_SECRET_KEY`: Already exists, used for Stripe API calls

### Optional

- `SUBSCRIPTION_PRICE_CENTS`: Defaults to 250 (£2.50) if not set
- `REFERRAL_DISCOUNT_THRESHOLD`: Minimum number of converted referrals to unlock discount (default 3)
- `REFERRAL_DISCOUNT_GRANDFATHER`: If `true`, existing users with `discounted=true` remain eligible regardless of count

## User Flow

1. **User A** shares their referral link with **User B**
2. **User B** signs up using the referral link (sets `referred_by` to User A's UUID)
3. **User B** upgrades to paid subscription
4. Stripe webhook triggers `convertReferral` for User B (on successful checkout)
5. System counts User A's successful invites (signups); when they reach 3, User A's `discounted` flag is set to `true`
6. If User A already has an active subscription, the 50% coupon is applied retroactively
7. On subsequent subscriptions or invoices, the coupon ensures the 50% recurring discount

## Testing

### Manual Testing Steps

1. Create two test users
2. Have User A share their referral link
3. Have User B sign up using the link
4. Verify User B's `referred_by` field is set
5. Have User B upgrade to paid (test webhook)
6. Verify User A's `discounted` flag is set to `true`
7. Check User A's Stripe balance for £10 credit
8. Verify discount appears in User A's billing UI

### Database Verification

```sql
-- Check if discount was applied
SELECT id, discounted, has_reffered_paid_user 
FROM users 
WHERE id = 'referrer-user-id';
```

## Error Handling

- All methods include try-catch blocks with detailed logging
- Graceful fallbacks if Stripe customer ID is missing
- Frontend shows loading states and error messages
- API endpoints return appropriate HTTP status codes

## Security Considerations

- All API endpoints require authentication
- Referral validation prevents self-referrals
- UUID validation ensures proper format
- Stripe webhook signature verification (already implemented)

## Future Enhancements

- Add referral analytics dashboard
- Implement referral limits (max referrals per user)
- Add referral expiration dates
- Create referral leaderboards
- Add email notifications for successful referrals 