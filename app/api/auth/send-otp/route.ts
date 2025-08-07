import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/auth/otp'
import { otpRateLimiter } from '@/lib/auth/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, captchaToken } = await req.json()
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!captchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification is required' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimitResult = await otpRateLimiter.check(req, phoneNumber)
    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime)
      const timeUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / 1000 / 60) // minutes
      
      return NextResponse.json(
        { 
          error: `Too many attempts. Please wait ${timeUntilReset} minutes before trying again.`,
          rateLimited: true,
          resetTime: rateLimitResult.resetTime,
          timeUntilReset
        },
        { status: 429 }
      )
    }

    // Send OTP with CAPTCHA verification
    const result = await otpService.sendOTP({
      phoneNumber,
      captchaToken,
      ipAddress
    })
    
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