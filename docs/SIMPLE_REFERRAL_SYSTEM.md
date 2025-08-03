# Simple Referral System

## Overview

A simple referral system where users can share their referral link and track who referred them.

## How It Works

### 1. Referral Link Generation
- Each user gets a unique referral link: `https://yourapp.com/signup?ref={userId}`
- Links are generated on-demand (no database storage needed)
- Example: `https://yourapp.com/signup?ref=123e4567-e89b-12d3-a456-426614174000`

### 2. Referral Process
1. User A shares their referral link with User B
2. User B clicks the link and goes to `/signup?ref=user-a-uuid`
3. The signup page automatically captures the referral UUID from the URL
4. During signup, User B's record gets `referred_by = user-a-uuid`
5. That's it! Simple and clean.

### 3. Database Schema
```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  referred_by UUID REFERENCES auth.users(id), -- Who referred this user
  -- ... other fields
)
```

## API Endpoints

### GET `/api/referrals/data`
Get current user's referral information.

**Response:**
```json
{
  "success": true,
  "data": {
    "referralLink": "https://yourapp.com/signup?ref=user-uuid",
    "hasBeenReferred": true,
    "referrerInfo": {
      "id": "referrer-uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### POST `/api/referrals/validate`
Validate a referral UUID and get the referrer ID.

**Request:**
```json
{
  "referralUUID": "user-uuid"
}
```

**Response:**
```json
{
  "valid": true,
  "referrerId": "user-uuid"
}
```

## Frontend Components

### Signup Page (`/signup`)
- Automatically captures referral UUID from URL
- Shows referral confirmation if present
- Integrates with existing signup flow

### Referral Dashboard
- Shows user's referral link
- Displays if user was referred by someone
- Simple copy-to-clipboard functionality

## Business Rules

1. **One Referrer Per User**: Each user can only be referred by one person
2. **No Self-Referral**: Users cannot refer themselves
3. **Simple Tracking**: Just track who referred you, no complex status tracking
4. **No Rewards**: Simple referral tracking without rewards system

## Benefits

- **Simple**: Single column in database
- **Fast**: No complex queries or joins
- **Maintainable**: Minimal code and logic
- **Scalable**: Easy to extend if needed
- **Clear**: Obvious who referred whom

## Usage Examples

### Generate Referral Link
```typescript
const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${userId}`;
```

### Process Referral During Signup
```typescript
// In signup flow
const referralUUID = getReferralUUIDForUserCreation();
if (referralUUID) {
  // Validate and use referral UUID
  const response = await fetch('/api/referrals/validate', {
    method: 'POST',
    body: JSON.stringify({ referralUUID })
  });
  // Use result.referrerId when creating user
}
```

### Display Referral Info
```typescript
const { data } = await fetch('/api/referrals/data').then(r => r.json());
console.log('My referral link:', data.referralLink);
console.log('Was I referred?', data.hasBeenReferred);
``` 