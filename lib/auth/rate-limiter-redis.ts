import { NextRequest } from 'next/server'

// Redis-based rate limiting (alternative to Supabase)
// Install with: npm install ioredis

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

export class RedisRateLimiter {
  private config: RateLimitConfig
  private redis: any // Redis client

  constructor(config: RateLimitConfig, redisClient: any) {
    this.config = config
    this.redis = redisClient
  }

  /**
   * Get client identifier (IP address or phone number)
   */
  private getClientId(req: NextRequest, phoneNumber?: string): string {
    if (phoneNumber) {
      return `phone:${phoneNumber}`
    }
    
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    
    return `ip:${ip}`
  }

  /**
   * Check if request is allowed using Redis
   */
  async check(req: NextRequest, phoneNumber?: string): Promise<RateLimitResult> {
    const clientId = this.getClientId(req, phoneNumber)
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const key = `rate_limit:${clientId}:${this.getRateLimitType()}`

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current requests in window
      pipeline.zcard(key)
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)
      
      // Set expiry on the key
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000))
      
      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Redis pipeline failed')
      }

      const currentCount = results[1][1] as number
      const newCount = currentCount + 1

      if (newCount > this.config.maxRequests) {
        // Get the oldest request to calculate reset time
        const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
        const resetTime = oldestRequest.length > 0 
          ? parseInt(oldestRequest[1]) + this.config.windowMs 
          : now + this.config.windowMs

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          error: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - now) / 1000)} seconds.`
        }
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - newCount,
        resetTime: now + this.config.windowMs
      }

    } catch (error) {
      console.error('Redis rate limit check error:', error)
      // Allow request if Redis error (fail open for availability)
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      }
    }
  }

  /**
   * Get rate limit type identifier
   */
  private getRateLimitType(): string {
    if (this.config.maxRequests === 3 && this.config.windowMs === 15 * 60 * 1000) {
      return 'otp_send'
    } else if (this.config.maxRequests === 2 && this.config.windowMs === 5 * 60 * 1000) {
      return 'otp_resend'
    } else if (this.config.maxRequests === 5 && this.config.windowMs === 10 * 60 * 1000) {
      return 'otp_verify'
    }
    return 'custom'
  }

  /**
   * Clean up expired entries (Redis handles this automatically with TTL)
   */
  async cleanup(): Promise<void> {
    // Redis automatically cleans up expired keys with TTL
    // No manual cleanup needed
  }
}

// Example usage with Redis client setup:
/*
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const otpRateLimiter = new RedisRateLimiter({
  maxRequests: 3,
  windowMs: 15 * 60 * 1000
}, redis)

export const resendRateLimiter = new RedisRateLimiter({
  maxRequests: 2,
  windowMs: 5 * 60 * 1000
}, redis)

export const verifyRateLimiter = new RedisRateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000
}, redis)
*/ 