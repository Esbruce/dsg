# Simplified Friend Referral System

## Overview

The referral system has been simplified to allow users to invite exactly one friend. This replaces the complex multi-table referral system with a simple single-column approach.

## Database Schema

### Users Table
- Added `friend_uuid` column (UUID, nullable)
- References `auth.users(id)` 
- Constraint prevents self-referral (`friend_uuid != id`)
- Indexed for performance

## API Endpoints

### GET `/api/referrals/data`
Get the current user's friend referral data.

**Response:**
```json
{
  "success": true,
  "data": {
    "referralLink": "https://yourapp.com/?ref=user-uuid",
    "hasInvitedFriend": true,
    "friendInfo": {
      "id": "friend-uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### POST `/api/referrals/create-friend`
Create a friend referral relationship.

**Request:**
```json
{
  "friendUuid": "friend-user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend referral created successfully"
}
```

## Usage Examples

### Frontend Usage

```typescript
// Get user's referral data
const response = await fetch('/api/referrals/data');
const { data } = await response.json();

if (data.hasInvitedFriend) {
  console.log('User has already invited a friend');
  console.log('Friend joined:', data.friendInfo?.createdAt);
} else {
  console.log('User can invite a friend');
  console.log('Referral link:', data.referralLink);
}

// Create friend referral
const createResponse = await fetch('/api/referrals/create-friend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ friendUuid: 'friend-uuid' })
});

const result = await createResponse.json();
if (result.success) {
  console.log('Friend referral created!');
}
```

### Backend Usage

```typescript
import { referralService } from '@/lib/referral/referral-service';

// Get referral data for a user
const data = await referralService.getFriendReferralData(userId);

// Create friend referral
await referralService.createFriendReferral(referrerId, refereeId);

// Check if user can invite
const canInvite = await referralService.canInviteFriend(userId);
```

## Business Rules

1. **One Friend Per User**: Each user can only invite one friend
2. **No Self-Referral**: Users cannot refer themselves
3. **No Double Referral**: A user cannot be referred by multiple people
4. **Simple Tracking**: No complex status tracking or rewards system

## Migration from Old System

The old complex referral system with multiple tables (`referrals`, `referral_rewards`, `referral_codes`) has been removed and replaced with this simple approach.

## Benefits

- **Simplified Database**: Single column instead of multiple tables
- **Better Performance**: Fewer queries and joins
- **Easier Maintenance**: Less complex business logic
- **Clearer Purpose**: Focused on simple friend invitations 