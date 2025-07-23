# Authentication System

This directory contains the authentication system for the DSG application, including OTP (One-Time Password) functionality with rate limiting.

## Architecture Overview

The authentication system follows a conventional pattern with:

- **Server-side OTP service** (`otp.ts`) - Handles Supabase OTP operations
- **Client-side hooks and service** (`otp-client.ts`) - React hooks and API client
- **API routes** (`/api/auth/*`) - HTTP endpoints with rate limiting
- **Rate limiting** (`rate-limiter.ts`) - Prevents abuse of OTP endpoints

## Files Structure

```
lib/auth/
├── otp.ts              # Server-side OTP service (no React dependencies)
├── otp-client.ts       # Client-side hooks and API client
├── rate-limiter.ts     # Rate limiting utilities
├── captcha.ts          # CAPTCHA verification utilities
└── README.md           # This file

app/api/auth/
├── send-otp/route.ts   # Send OTP endpoint
├── verify-otp/route.ts # Verify OTP endpoint
└── resend-otp/route.ts # Resend OTP endpoint
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Usage

### Server-side (API routes)

```typescript
import { otpService } from '@/lib/auth/otp'
import { otpRateLimiter } from '@/lib/auth/rate-limiter'

// Send OTP
const result = await otpService.sendOTP(phoneNumber)

// Verify OTP
const result = await otpService.verifyOTP(phoneNumber, otp)

// Check rate limit
const rateLimitResult = otpRateLimiter.check(req, phoneNumber)
```

### Client-side (React components)

```typescript
import { 
  otpClientService, 
  useOTPState, 
  useOTPTimers 
} from '@/lib/auth/otp-client'

// In your component
const { state, updateState } = useOTPState()
const { otpTimer, startTimers } = useOTPTimers()

// Send OTP
const result = await otpClientService.sendOTP(phoneNumber)

// Verify OTP
const result = await otpClientService.verifyOTP(phoneNumber, otp)

// Resend OTP
const result = await otpClientService.resendOTP(phoneNumber)
```

## Rate Limiting

The system includes three rate limiters:

- **OTP Send**: 3 attempts per 15 minutes
- **OTP Resend**: 2 attempts per 5 minutes  
- **OTP Verify**: 5 attempts per 10 minutes

Rate limits are applied per phone number and IP address.



## Security Features

1. **Rate Limiting**: Prevents abuse of OTP endpoints
2. **Server-side Validation**: All validation happens on the server
3. **IP Tracking**: Rate limits consider both phone number and IP
4. **Secure Headers**: Proper error handling and status codes

## API Endpoints

### POST /api/auth/send-otp
Send OTP to a phone number.

**Request:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "remaining": 2,
  "resetTime": 1640995200000
}
```

### POST /api/auth/verify-otp
Verify OTP code.

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "session": { /* Supabase session */ },
  "remaining": 4,
  "resetTime": 1640995200000
}
```

### POST /api/auth/resend-otp
Resend OTP to a phone number.

**Request:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "remaining": 1,
  "resetTime": 1640995200000
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common error status codes:
- `400`: Bad request (invalid input)
- `429`: Rate limit exceeded
- `500`: Internal server error

## Production Considerations

1. **Redis**: Replace in-memory rate limiting with Redis for production
2. **Monitoring**: Add logging and monitoring for rate limit violations
3. **SMS Provider**: Ensure your SMS provider has proper rate limiting
4. **HTTPS**: Always use HTTPS in production for secure communication 