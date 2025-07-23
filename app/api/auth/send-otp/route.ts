import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/auth/otp'
import { otpRateLimiter } from '@/lib/auth/rate-limiter'
import { captchaVerifier, getClientIP } from '@/lib/auth/captcha'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, captchaToken } = await req.json()

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Verify CAPTCHA if token provided
    if (captchaToken) {
      const clientIP = getClientIP(req)
      const captchaResult = await captchaVerifier.verifyRecaptcha(captchaToken, clientIP)
      
      if (!captchaResult.success) {
        return NextResponse.json(
          { error: captchaResult.error || 'CAPTCHA verification failed' },
          { status: 400 }
        )
      }
    }

    // Check rate limit
    const rateLimitResult = otpRateLimiter.check(req, phoneNumber)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Send OTP
    const result = await otpService.sendOTP(phoneNumber)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
} 