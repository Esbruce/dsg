# Checkout Issue Fix

## Problem Description
Users were experiencing a 500 error when trying to access Stripe checkout, particularly when they had a discount available (`discounted: true` in the database). Additionally, users wanted a permanent discount that applies automatically each month rather than a one-time balance credit.

## Root Cause Analysis
The issue was caused by several potential problems in the checkout process:

1. **Invalid Stripe API Usage**: The original code was using `price_data` with `unit_amount` for subscriptions, which is not the correct approach for Stripe subscriptions.

2. **Missing Stripe Price ID**: The checkout was trying to create dynamic pricing without a proper Stripe Price ID.

3. **Incorrect Discount Implementation**: The original approach used customer balance credits, which only applied once and didn't provide ongoing discounts.

4. **Customer Balance Conflicts**: When users had discounts, the system applied negative balances (credits) to their Stripe customer accounts. This could cause conflicts during checkout session creation.

5. **Race Conditions**: There were potential timing issues between when customer balances were applied and when checkout sessions were created.

6. **Insufficient Error Handling**: The original code didn't handle edge cases properly, leading to cryptic 500 errors.

## Fixes Implemented

### 1. Fixed Stripe API Usage (`app/api/stripe/checkout/route.ts`)

- **Proper Price ID Usage**: Changed from `price_data` to using `price: process.env.STRIPE_PRICE_ID` for subscriptions
- **Added STRIPE_PRICE_ID validation**: Ensures the required environment variable is present
- **Implemented Coupon-Based Discounts**: Uses Stripe coupons for permanent, recurring discounts instead of customer balance
- **Enhanced error messages**: More specific error responses for different failure scenarios
- **Added logging**: Comprehensive logging for debugging checkout issues

### 2. Enhanced Webhook Handling (`app/api/stripe/webhook/route.ts`)

- **Automatic Coupon Application**: Applies referral discount coupons to new subscriptions
- **Subscription Discount Management**: Ensures discounts are applied to recurring subscriptions
- **Improved error handling**: Better handling of discount application failures

### 3. Enhanced Referral Service (`lib/referral/referral-service.ts`)

- **Improved balance application**: Better validation and error handling when applying referral rewards
- **Balance limits**: Added safety checks to prevent excessive negative balances
- **Enhanced logging**: More detailed logging for debugging referral reward issues

### 4. Better Frontend Error Handling (`app/(app)/billing/page.tsx`)

- **Enhanced error messages**: More informative error messages for users
- **Improved debugging**: Added console logging to help identify issues
- **Better error parsing**: Extracts error details from API responses

### 5. Added Testing Endpoint

- **Checkout logic test**: New GET endpoint at `/api/stripe/checkout?test=checkout-logic` to test checkout logic without creating actual sessions
- **Environment validation**: Checks for required environment variables including STRIPE_PRICE_ID
- **Pricing validation**: Validates discount calculations

### 6. Added Setup Scripts

- **Stripe Price ID Setup**: New script at `scripts/create-stripe-price.js` to create the required Stripe Price ID
- **Referral Coupon Setup**: New script at `scripts/create-stripe-coupon.js` to create the referral discount coupon

## Setup Instructions

### 1. Create Stripe Price ID

Run the setup script to create the required Stripe Price ID:

```bash
node scripts/create-stripe-price.js
```

This will:
- Create a Stripe product for DSG Pro Subscription
- Create a monthly recurring price of £2.50
- Output the required environment variables

### 2. Create Referral Discount Coupon

Run the setup script to create the referral discount coupon:

```bash
node scripts/create-stripe-coupon.js
```

This will:
- Create a permanent 50% discount coupon
- Apply to all future subscriptions for users with discounts
- Output the required environment variables

### 3. Add Environment Variables

Add the following to your environment variables:

```env
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_REFERRAL_COUPON_ID=coupon_xxxxxxxxxxxxx
```

### 4. Verify Configuration

Test your configuration by visiting:
`https://your-domain.com/api/stripe/checkout?test=checkout-logic`

This will verify:
- All required environment variables are present
- Stripe API connectivity
- User authentication
- Discount status retrieval

## How the New Discount System Works

### Before (Customer Balance Approach)
- ❌ One-time credit applied to customer balance
- ❌ User sees £1.25 then £2.50 in checkout
- ❌ Discount doesn't apply to future months
- ❌ Complex balance management

### After (Coupon Approach)
- ✅ Permanent 50% discount applied via Stripe coupon
- ✅ User always sees £1.25 (50% off £2.50)
- ✅ Discount applies automatically to all future months
- ✅ Clean, simple implementation

### Benefits of the New System
1. **Permanent Discounts**: Users with referral discounts always pay £1.25/month
2. **Automatic Application**: No manual balance management required
3. **Cleaner UI**: Users see the discounted price directly
4. **Better Stripe Integration**: Uses Stripe's native coupon system
5. **Easier Management**: All discount logic handled by Stripe

## Testing Procedures

### 1. Test the Checkout Logic
Visit: `https://your-domain.com/api/stripe/checkout?test=checkout-logic`

This will test:
- User authentication
- Discount status retrieval
- User data retrieval
- Pricing calculations
- Customer balance retrieval
- Environment variable validation (including STRIPE_PRICE_ID and STRIPE_REFERRAL_COUPON_ID)

### 2. Test the Actual Checkout
1. Navigate to the billing page
2. Open browser developer tools (F12)
3. Check the Console tab for detailed logging
4. Click "Upgrade" button
5. Monitor the console for any errors or warnings

### 3. Test with Different User States
- **User without discount**: Should see £2.50/month
- **User with discount**: Should see £1.25/month (50% off)
- **User with existing subscription**: Should have discount applied to next billing cycle

## Monitoring and Debugging

### Console Logs to Watch For
- `"Starting checkout process..."`
- `"Discount status retrieved:"`
- `"Customer balance retrieved:"`
- `"Created referral discount coupon:"`
- `"Applied referral discount coupon:"`
- `"Checkout session created successfully:"`
- Any error messages starting with `"❌"`

### Common Error Scenarios
1. **Missing STRIPE_PRICE_ID**: Run the setup script and add the environment variable
2. **Missing STRIPE_REFERRAL_COUPON_ID**: Run the coupon setup script
3. **Invalid unit amount**: Check discount calculation logic
4. **Customer balance errors**: Check Stripe customer state
5. **Authentication errors**: Check user session
6. **Environment variable issues**: Check deployment configuration

## Environment Variables Required
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PRICE_ID`: Stripe Price ID for the subscription (created by setup script)
- `STRIPE_REFERRAL_COUPON_ID`: Stripe Coupon ID for referral discounts (created by setup script)
- `NEXT_PUBLIC_BASE_URL`: Base URL for success/cancel redirects
- `SUBSCRIPTION_PRICE_CENTS`: Subscription price in cents (defaults to 250)

## Deployment Notes
1. **Run both setup scripts** to create the Stripe Price ID and Coupon ID
2. **Add all environment variables** to your deployment
3. **Test the checkout logic endpoint** after deployment
4. **Monitor logs** for any checkout-related errors
5. **Consider implementing Stripe webhook monitoring** for additional debugging

## Rollback Plan
If issues persist, you can:
1. **Temporarily disable discount functionality** by setting `discounted: false` for affected users
2. **Use the original checkout logic** (available in git history)
3. **Implement a feature flag** to toggle between old and new checkout logic
4. **Check Stripe Dashboard** for any API errors or failed requests 