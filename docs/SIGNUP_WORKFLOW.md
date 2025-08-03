# Signup Workflow

## Overview

The signup workflow is based on the existing login modal but adapted specifically for creating new user accounts. It includes referral handling and prevents existing users from signing up again.

## How It Works

### 1. Signup Page (`/signup`)
- **URL**: `https://yourapp.com/signup?ref={referral-uuid}`
- **Purpose**: Dedicated page for new user registration
- **Features**: 
  - Referral link handling
  - Phone number validation
  - CAPTCHA verification
  - OTP verification
  - Automatic user creation

### 2. Signup Flow Steps

#### Step 1: Phone Number Input
- User enters UK phone number
- System validates phone number format
- Shows CAPTCHA for security

#### Step 2: CAPTCHA Verification
- User completes CAPTCHA challenge
- System validates CAPTCHA token
- Automatically sends OTP to phone number

#### Step 3: OTP Verification
- User enters 6-digit verification code
- System verifies OTP with Supabase
- Creates new user account if verification succeeds

#### Step 4: Referral Processing
- If user came through referral link, processes referral
- Sets `referred_by` field in user record
- Redirects to main app

### 3. Key Features

#### Existing User Prevention
```typescript
// Check if user already exists before signup
const userExists = await clientAuthService.checkUserExists(normalizedPhone);

if (userExists) {
  setError("An account with this phone number already exists. Please sign in instead.");
  return;
}
```

#### Referral Integration
```typescript
// Handle referral after successful signup
try {
  await createUserWithReferral();
} catch (referralError) {
  console.error('Error handling referral:', referralError);
  // Don't fail the auth flow if referral fails
}
```

#### Signup-Specific OTP
```typescript
// Use signup method instead of generic sign in/sign up
const result = await clientAuthService.signUpWithOTP(phoneNumber);
```

## API Integration

### OTP Service
- Uses `clientAuthService.signUpWithOTP()` for new users
- Uses `clientAuthService.checkUserExists()` to prevent duplicates
- Integrates with existing OTP validation and timer system

### Referral Service
- Automatically captures referral UUID from URL
- Validates referral UUID during signup
- Creates referral relationship in database

## User Experience

### For New Users
1. Visit `/signup` (with or without referral link)
2. Enter phone number
3. Complete CAPTCHA
4. Enter verification code
5. Account created and redirected to app

### For Existing Users
1. Visit `/signup`
2. Enter phone number
3. System detects existing account
4. Shows error message directing to sign in
5. User can click "Sign in here" link

### For Referred Users
1. Click referral link: `/signup?ref=user-uuid`
2. See referral confirmation message
3. Complete normal signup flow
4. Referral automatically processed
5. Referrer relationship established

## Error Handling

### Common Errors
- **Invalid phone number**: Shows validation error
- **User already exists**: Redirects to sign in
- **Invalid OTP**: Shows retry message
- **CAPTCHA failure**: Shows retry option
- **Referral validation failure**: Continues without referral

### Graceful Degradation
- Referral failures don't block signup
- Network errors show user-friendly messages
- Rate limiting handled automatically

## Security Features

### CAPTCHA Protection
- Required for all signup attempts
- Prevents automated signups
- Uses Cloudflare Turnstile

### Phone Verification
- OTP-based verification
- 6-digit codes with expiration
- Rate limiting on OTP requests

### User Validation
- Prevents duplicate accounts
- Validates phone number format
- Checks referral UUID validity

## Integration Points

### With Login Modal
- Shares same OTP components
- Uses same validation logic
- Consistent user experience

### With Referral System
- Automatic referral capture
- Seamless referral processing
- No additional user steps required

### With Main App
- Automatic redirect after signup
- Session established immediately
- User data available instantly

## Testing

### Test Cases
1. **New user signup** (no referral)
2. **New user signup** (with referral)
3. **Existing user signup attempt**
4. **Invalid phone number**
5. **Invalid OTP**
6. **CAPTCHA failure**
7. **Network errors**

### Test URLs
- `/signup` - Basic signup
- `/signup?ref=test-uuid` - Signup with referral
- `/signup?ref=invalid-uuid` - Invalid referral

## Future Enhancements

### Potential Improvements
- Email collection (optional)
- Profile completion after signup
- Welcome email/notification
- Onboarding flow
- Social signup options

### Analytics
- Signup conversion tracking
- Referral effectiveness
- Drop-off point analysis
- User journey optimization 