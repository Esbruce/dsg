# Rate Limiting Implementation

## Overview

This document explains the rate limiting implementation for the DSG app, which protects against abuse and ensures fair usage of the API endpoints.

## Current Implementation

### Supabase-Based Rate Limiting (Recommended)

The app now uses a **Supabase-based rate limiting system** that is:
- ✅ **Persistent** across server restarts
- ✅ **Scalable** for production use
- ✅ **Secure** with RLS policies
- ✅ **Reliable** with proper error handling

### Rate Limits

| Endpoint | Type | Limit | Window | Purpose |
|----------|------|-------|--------|---------|
| `/api/auth/send-otp` | OTP Send | 3 requests | 15 minutes | Prevent SMS spam |
| `/api/auth/resend-otp` | OTP Resend | 2 requests | 5 minutes | Prevent resend abuse |
| `/api/auth/verify-otp` | OTP Verify | 5 requests | 10 minutes | Prevent brute force |

## Setup Instructions

### 1. Database Migration ✅ **COMPLETED**

The `rate_limits` table has been successfully created using Supabase MCP tools:

- ✅ **Table Created**: `rate_limits` with all required columns
- ✅ **Indexes Added**: Performance-optimized indexes
- ✅ **RLS Policies**: Security policies applied
- ✅ **Triggers**: Automatic timestamp updates
- ✅ **Comments**: Documentation added to table and columns

**No manual migration needed** - everything is already set up and ready to use!

### 2. Verify Implementation ✅ **READY TO TEST**

The rate limiting is now **fully active and ready to use**! Test it by:

1. **Send multiple OTP requests** quickly from the same IP/phone
2. **Check for rate limit errors** after exceeding the limits (3 requests per 15 minutes)
3. **Monitor the `rate_limits` table** in Supabase to see the data being tracked

**Your rate limiting is now production-ready!** 🚀

## Architecture

### Database Schema

```sql
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY,
    client_id TEXT NOT NULL,        -- IP or phone number
    type TEXT NOT NULL,             -- Rate limit type
    count INTEGER NOT NULL,         -- Current request count
    reset_time TIMESTAMP NOT NULL,  -- When window resets
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Features

1. **Client Identification**: Uses IP address or phone number
2. **Type-Based Limits**: Different limits for different operations
3. **Automatic Cleanup**: Expired entries are automatically removed
4. **Fail-Open**: If database errors occur, requests are allowed
5. **RLS Security**: Only service role can access rate limit data

## Alternative: Redis-Based Rate Limiting

For high-traffic applications, you can use Redis instead:

### Setup Redis

```bash
npm install ioredis
```

### Environment Variables

```env
REDIS_URL=redis://localhost:6379
# or for production: redis://username:password@host:port
```

### Usage

```typescript
import { RedisRateLimiter } from '@/lib/auth/rate-limiter-redis'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const otpRateLimiter = new RedisRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000
}, redis)
```

## Monitoring and Debugging

### View Rate Limit Data

```sql
-- Check current rate limits
SELECT * FROM rate_limits ORDER BY created_at DESC LIMIT 10;

-- Check specific client
SELECT * FROM rate_limits WHERE client_id = 'phone:+1234567890';

-- Check expired entries
SELECT * FROM rate_limits WHERE reset_time < NOW();
```

### Rate Limit Headers

The API returns rate limit information in response headers:

```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1640995200
```

## Security Considerations

### 1. Client Identification

- **Phone Numbers**: Used when available for OTP operations
- **IP Addresses**: Fallback for general API requests
- **Proxy Handling**: Supports `X-Forwarded-For` and `X-Real-IP` headers

### 2. Rate Limit Bypass Prevention

- **Server-Side Only**: Rate limiting happens on the server
- **Database Storage**: Cannot be bypassed by client-side manipulation
- **RLS Policies**: Database access is restricted to service role

### 3. Error Handling

- **Fail-Open**: If rate limiting fails, requests are allowed
- **Graceful Degradation**: App continues to work even if rate limiting is down
- **Error Logging**: All errors are logged for monitoring

## Performance Optimization

### 1. Database Indexes

The migration creates optimal indexes:

```sql
CREATE INDEX idx_rate_limits_client_type ON rate_limits(client_id, type);
CREATE INDEX idx_rate_limits_reset_time ON rate_limits(reset_time);
CREATE UNIQUE INDEX idx_rate_limits_unique_client_type ON rate_limits(client_id, type);
```

### 2. Automatic Cleanup

- **Scheduled Cleanup**: Runs every 5 minutes
- **Efficient Queries**: Uses timestamp-based deletion
- **Minimal Impact**: Cleanup doesn't block requests

### 3. Connection Pooling

- **Supabase Connection Pool**: Reuses database connections
- **Efficient Queries**: Single query per rate limit check
- **Transaction Safety**: Uses database transactions for consistency

## Troubleshooting

### Common Issues

1. **Rate Limits Not Working**
   - Check if migration was applied
   - Verify RLS policies are correct
   - Check service role permissions

2. **Database Errors**
   - Check Supabase connection
   - Verify environment variables
   - Check database logs

3. **Performance Issues**
   - Monitor database query performance
   - Check if indexes are being used
   - Consider Redis for high-traffic scenarios

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show rate limit operations in the console.

## Production Deployment

### 1. Environment Setup

Ensure these environment variables are set:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

### 2. Monitoring

Set up monitoring for:

- Rate limit violations
- Database performance
- Error rates
- API response times

### 3. Scaling

For high-traffic applications:

1. **Consider Redis**: Switch to Redis-based rate limiting
2. **Database Optimization**: Monitor and optimize queries
3. **CDN Rate Limiting**: Add edge-level rate limiting
4. **Load Balancing**: Distribute rate limiting across instances

## Migration from In-Memory

The old in-memory rate limiting has been replaced. The new system:

- ✅ **Persists** across server restarts
- ✅ **Scales** across multiple server instances
- ✅ **Provides** better security and monitoring
- ✅ **Offers** production-ready reliability

No code changes are needed - the API interface remains the same. 