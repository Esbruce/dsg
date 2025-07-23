import { NextRequest, NextResponse } from 'next/server'
import { otpService } from '@/lib/auth/otp'
import { verifyRateLimiter } from '@/lib/auth/rate-limiter'

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otp } = await req.json()
    
    console.log('🔍 Verify OTP request:', { phoneNumber, otp: otp ? '***' : 'missing' })

    // Validate required fields
    if (!phoneNumber || !otp) {
      console.log('❌ Missing required fields:', { phoneNumber: !!phoneNumber, otp: !!otp })
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimitResult = verifyRateLimiter.check(req, phoneNumber)
    if (!rateLimitResult.allowed) {
      console.log('❌ Rate limit exceeded:', rateLimitResult.error)
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    console.log('✅ Rate limit passed, verifying OTP...')

    // Verify OTP
    const result = await otpService.verifyOTP(phoneNumber, otp)
    
    console.log('🔍 OTP verification result:', { 
      success: result.success, 
      error: result.error,
      hasSession: !!result.session 
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    console.log('✅ OTP verification successful')
    return NextResponse.json({ 
      success: true,
      session: result.session,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    })
  } catch (error) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    )
  }
} 