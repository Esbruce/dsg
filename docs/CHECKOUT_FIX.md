# Checkout Issue Fix

## Problem Description
Users were experiencing a 500 error when trying to access Stripe checkout, particularly when they had a discount available (`discounted: true` in the database).

## Root Cause Analysis
The issue was caused by several potential problems in the checkout process:

1. **Customer Balance Conflicts**: When users had discounts, the system applied negative balances (credits) to their Stripe customer accounts. This could cause conflicts during checkout session creation.

2. **Race Conditions**: There were potential timing issues between when customer balances were applied and when checkout sessions were created.

3. **Insufficient Error Handling**: The original code didn't handle edge cases properly, leading to cryptic 500 errors.

4. **Invalid Pricing Calculations**: The discount calculation could potentially result in invalid amounts for Stripe.

## Fixes Implemented

### 1. Improved Error Handling in Checkout Route (`app/api/stripe/checkout/route.ts`)

- **Added validation for unit amounts**: Ensures the calculated price is valid before creating the checkout session
- **Improved customer balance retrieval**: Better error handling when retrieving customer balances
- **Enhanced error messages**: More specific error responses for different failure scenarios
- **Added logging**: Comprehensive logging for debugging checkout issues
- **Simplified customer update logic**: Removed potential conflicts in customer update settings

### 2. Enhanced Referral Service (`lib/referral/referral-service.ts`)

- **Improved balance application**: Better validation and error handling when applying referral rewards
- **Balance limits**: Added safety checks to prevent excessive negative balances
- **Enhanced logging**: More detailed logging for debugging referral reward issues

### 3. Better Frontend Error Handling (`app/(app)/billing/page.tsx`)

- **Enhanced error messages**: More informative error messages for users
- **Improved debugging**: Added console logging to help identify issues
- **Better error parsing**: Extracts error details from API responses

### 4. Added Testing Endpoint

- **Checkout logic test**: New GET endpoint at `/api/stripe/checkout?test=checkout-logic` to test checkout logic without creating actual sessions
- **Environment validation**: Checks for required environment variables
- **Pricing validation**: Validates discount calculations

## Testing Procedures

### 1. Test the Checkout Logic
Visit: `https://your-domain.com/api/stripe/checkout?test=checkout-logic`

This will test:
- User authentication
- Discount status retrieval
- User data retrieval
- Pricing calculations
- Customer balance retrieval
- Environment variable validation

### 2. Test the Actual Checkout
1. Navigate to the billing page
2. Open browser developer tools (F12)
3. Check the Console tab for detailed logging
4. Click "Upgrade" button
5. Monitor the console for any errors or warnings

### 3. Test with Different User States
- **User without discount**: Should work normally
- **User with discount**: Should apply 50% discount
- **User with existing customer balance**: Should handle balance correctly

## Monitoring and Debugging

### Console Logs to Watch For
- `"Starting checkout process..."`
- `"Discount status retrieved:"`
- `"Customer balance retrieved:"`
- `"Checkout session created successfully:"`
- Any error messages starting with `"❌"`

### Common Error Scenarios
1. **Invalid unit amount**: Check discount calculation logic
2. **Customer balance errors**: Check Stripe customer state
3. **Authentication errors**: Check user session
4. **Environment variable issues**: Check deployment configuration

## Environment Variables Required
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_BASE_URL`: Base URL for success/cancel redirects
- `SUBSCRIPTION_PRICE_CENTS`: Subscription price in cents (defaults to 250)

## Deployment Notes
1. Ensure all environment variables are set correctly
2. Test the checkout logic endpoint after deployment
3. Monitor logs for any checkout-related errors
4. Consider implementing Stripe webhook monitoring for additional debugging

## Rollback Plan
If issues persist, you can:
1. Temporarily disable discount functionality by setting `discounted: false` for affected users
2. Use the original checkout logic (available in git history)
3. Implement a feature flag to toggle between old and new checkout logic 