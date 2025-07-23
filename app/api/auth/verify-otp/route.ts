import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/auth/otp'
import { verifyRateLimiter } from '@/lib/auth/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json()

    // Validate required fields
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimitResult = await verifyRateLimiter.check(req, phoneNumber)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Verify OTP
    const result = await otpService.verifyOTP(phoneNumber, otp)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      session: result.session,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    )
  }
} 