import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/auth/otp'
import { resendRateLimiter } from '@/lib/auth/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json()

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimitResult = await resendRateLimiter.check(req, phoneNumber)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Resend OTP
    const result = await otpService.resendOTP(phoneNumber)
    
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
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    )
  }
} 