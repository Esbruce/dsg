import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
   * Check if request is allowed using Supabase
   */
  async check(req: NextRequest, phoneNumber?: string): Promise<RateLimitResult> {
    const clientId = this.getClientId(req, phoneNumber)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // First, clean up expired entries
      await this.cleanup()

      // Get current rate limit data from database
      const { data: rateLimitData, error: fetchError } = await supabaseAdmin
        .from('rate_limits')
        .select('*')
        .eq('client_id', clientId)
        .eq('type', this.getRateLimitType())
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Rate limit fetch error:', fetchError)
        // Allow request if database error (fail open for availability)
        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: now + this.config.windowMs
        }
      }

      if (!rateLimitData) {
        // First request - create new entry
        const resetTime = now + this.config.windowMs
        const { error: insertError } = await supabaseAdmin
          .from('rate_limits')
          .insert([{
            client_id: clientId,
            type: this.getRateLimitType(),
            count: 1,
            reset_time: new Date(resetTime).toISOString(),
            created_at: new Date().toISOString()
          }])

        if (insertError) {
          console.error('Rate limit insert error:', insertError)
          // Allow request if database error
          return {
            allowed: true,
            remaining: this.config.maxRequests - 1,
            resetTime
          }
        }

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime
        }
      }

      // Check if window has expired
      const resetTime = new Date(rateLimitData.reset_time).getTime()
      if (now > resetTime) {
        // Window expired - reset counter
        const newResetTime = now + this.config.windowMs
        const { error: updateError } = await supabaseAdmin
          .from('rate_limits')
          .update({
            count: 1,
            reset_time: new Date(newResetTime).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('client_id', clientId)
          .eq('type', this.getRateLimitType())

        if (updateError) {
          console.error('Rate limit reset error:', updateError)
          return {
            allowed: true,
            remaining: this.config.maxRequests - 1,
            resetTime: newResetTime
          }
        }

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: newResetTime
        }
      }

      // Check if rate limit exceeded
      if (rateLimitData.count >= this.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          error: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - now) / 1000)} seconds.`
        }
      }

      // Increment count
      const { error: incrementError } = await supabaseAdmin
        .from('rate_limits')
        .update({
          count: rateLimitData.count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('type', this.getRateLimitType())

      if (incrementError) {
        console.error('Rate limit increment error:', incrementError)
        // Allow request if database error
        return {
          allowed: true,
          remaining: this.config.maxRequests - (rateLimitData.count + 1),
          resetTime
        }
      }

      return {
        allowed: true,
        remaining: this.config.maxRequests - (rateLimitData.count + 1),
        resetTime
      }

    } catch (error) {
      console.error('Rate limit check error:', error)
      // Allow request if any error occurs (fail open for availability)
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
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    try {
      const now = new Date()
      const { error } = await supabaseAdmin
        .from('rate_limits')
        .delete()
        .lt('reset_time', now.toISOString())

      if (error) {
        console.error('Rate limit cleanup error:', error)
      }
    } catch (error) {
      console.error('Rate limit cleanup error:', error)
    }
  }
}

// Pre-configured rate limiters for different use cases
export const otpRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts per window (reduced from 8)
  windowMs: 15 * 60 * 1000 // 15 minutes (increased from 10)
})

export const resendRateLimiter = new RateLimiter({
  maxRequests: 3, // 3 resend attempts per window (reduced from 5)
  windowMs: 5 * 60 * 1000 // 5 minutes (increased from 3)
})

export const verifyRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 verification attempts per window (reduced from 15)
  windowMs: 15 * 60 * 1000 // 15 minutes (unchanged)
})

// Clean up expired entries every 5 minutes (only in server environment)
if (typeof window === 'undefined') {
  setInterval(async () => {
    await otpRateLimiter.cleanup()
    await resendRateLimiter.cleanup()
    await verifyRateLimiter.cleanup()
  }, 5 * 60 * 1000)
} 