# Referral Discount System

## Overview

The referral discount system allows users to earn 50% off their next billing cycle for each friend who subscribes using their referral link.

## Features

- **Unique Referral Codes**: Each user gets a unique 8-character alphanumeric referral code
- **Referral Tracking**: Track pending and converted referrals
- **Automatic Rewards**: 50% discount automatically applied to referrer's next invoice
- **Dashboard**: Visual dashboard showing referral stats and recent referrals
- **Security**: Row Level Security (RLS) policies protect user data

## Database Schema

### Tables

#### `referral_codes`
- `id`: UUID primary key
- `user_id`: References auth.users(id)
- `referral_code`: Unique 8-character alphanumeric code
- `is_active`: Boolean flag
- `created_at`, `updated_at`: Timestamps

#### `referrals`
- `id`: UUID primary key
- `referrer_id`: User who made the referral
- `referee_id`: User who was referred
- `status`: 'pending', 'converted', or 'expired'
- `converted_at`: When the referral was converted
- `created_at`, `updated_at`: Timestamps

#### `referral_rewards`
- `id`: UUID primary key
- `referral_id`: References referrals(id)
- `referrer_id`: User who earned the reward
- `reward_type`: 'credit' or 'discount'
- `amount_cents`: Reward amount in cents
- `currency`: Currency code (default: 'gbp')
- `stripe_invoice_item_id`: Stripe invoice item ID
- `applied_at`, `created_at`: Timestamps

## API Endpoints

### `/api/referrals/create-code`
- **Method**: POST
- **Description**: Generate a referral code for the authenticated user
- **Response**: `{ success: true, referralCode: string, referralLink: string }`

### `/api/referrals/data`
- **Method**: GET
- **Description**: Get referral data for the authenticated user
- **Response**: `{ success: true, data: ReferralData }`

### `/api/referrals/validate`
- **Method**: POST
- **Body**: `{ referralCode: string }`
- **Description**: Validate a referral code
- **Response**: `{ success: true, valid: boolean, referrerId?: string }`

## User Flow

### 1. Referrer Flow
1. User visits billing page
2. Referral dashboard shows their unique referral link
3. User shares the link with friends
4. When a friend subscribes, referrer gets 50% off next billing cycle

### 2. Referee Flow
1. User clicks referral link (e.g., `https://yourapp.com/?ref=ABC12345`)
2. Referral code is stored in localStorage
3. User signs up normally
4. Referral relationship is created in database
5. When user subscribes, referral is marked as converted

## Implementation Details

### Referral Code Generation
- Uses database function `generate_referral_code()`
- Generates 8-character alphanumeric codes
- Ensures uniqueness through database constraints

### Security
- Row Level Security (RLS) policies protect all referral tables
- Users can only view their own referral data
- Referral codes are validated server-side

### Stripe Integration
- Referral rewards are applied as Stripe invoice items
- 50% discount calculated from referrer's current subscription
- Rewards are tracked in `referral_rewards` table

## Setup Instructions

### 1. Run Database Migration
```bash
node scripts/run-referral-migration.js
```

### 2. Environment Variables
Ensure these environment variables are set:
- `NEXT_PUBLIC_BASE_URL`: Your app's base URL
- `STRIPE_SECRET_KEY`: Stripe secret key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### 3. Testing
1. Create a test user
2. Generate a referral code
3. Use the referral link to create another user
4. Subscribe the referred user
5. Verify the referrer gets a discount

## Edge Cases Handled

- **Self-referrals**: Prevented at database level
- **Duplicate referrals**: Unique constraint on referrer_id + referee_id
- **Invalid codes**: Server-side validation
- **Failed payments**: No reward given
- **Expired codes**: Status tracking

## Monitoring

### Key Metrics
- Total referrals per user
- Conversion rate
- Revenue impact
- Most active referrers

### Logs
- Referral creation events
- Conversion events
- Reward processing events
- Error events

## Troubleshooting

### Common Issues

1. **Referral code not working**
   - Check if code exists in database
   - Verify code is active
   - Check RLS policies

2. **Reward not applied**
   - Check Stripe webhook logs
   - Verify referrer has active subscription
   - Check referral_rewards table

3. **Dashboard not loading**
   - Check API endpoint responses
   - Verify user authentication
   - Check browser console for errors

### Debug Commands

```sql
-- Check referral codes for a user
SELECT * FROM referral_codes WHERE user_id = 'user-uuid';

-- Check referrals for a user
SELECT * FROM referrals WHERE referrer_id = 'user-uuid';

-- Check rewards for a user
SELECT * FROM referral_rewards WHERE referrer_id = 'user-uuid';
```

## Future Enhancements

- **Tiered rewards**: Different rewards for different subscription tiers
- **Referral limits**: Maximum referrals per user
- **Expiration dates**: Referral codes that expire
- **Analytics dashboard**: Detailed referral analytics
- **Email notifications**: Notify users of successful referrals 