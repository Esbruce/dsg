import { NextRequest } from 'next/server'

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

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

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Get client identifier (IP address or phone number)
   */
  private getClientId(req: NextRequest, phoneNumber?: string): string {
    // Use phone number if available, otherwise use IP
    if (phoneNumber) {
      return `phone:${phoneNumber}`
    }
    
    // Get IP address from request
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'
    
    return `ip:${ip}`
  }

  /**
   * Check if request is allowed
   */
  check(req: NextRequest, phoneNumber?: string): RateLimitResult {
    const clientId = this.getClientId(req, phoneNumber)
    const now = Date.now()
    
    // Get current rate limit data
    const current = rateLimitStore.get(clientId)
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      const resetTime = now + this.config.windowMs
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime
      })
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }
    
    if (current.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        error: `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`
      }
    }
    
    // Increment count
    current.count++
    rateLimitStore.set(clientId, current)
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }

  /**
   * Clean up expired entries (call periodically in production)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const otpRateLimiter = new RateLimiter({
  maxRequests: 3, // 3 attempts per window
  windowMs: 15 * 60 * 1000 // 15 minutes
})

export const resendRateLimiter = new RateLimiter({
  maxRequests: 2, // 2 resend attempts per window
  windowMs: 5 * 60 * 1000 // 5 minutes
})

export const verifyRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 verification attempts per window
  windowMs: 10 * 60 * 1000 // 10 minutes
})

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    otpRateLimiter.cleanup()
    resendRateLimiter.cleanup()
    verifyRateLimiter.cleanup()
  }, 5 * 60 * 1000)
} 