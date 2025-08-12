import { NextRequest, NextResponse } from 'next/server'
import { referralService } from '@/lib/referral/referral-service'

export async function POST(req: NextRequest) {
  try {
    const { referralUUID } = await req.json()

    if (!referralUUID || typeof referralUUID !== 'string') {
      return NextResponse.json({ valid: false, error: 'Referral UUID is required' }, { status: 400 })
    }

    // Validate UUID and resolve to a referrer user id if present
    const referrerId = await referralService.getReferrerFromUUID(referralUUID)

    if (!referrerId) {
      return NextResponse.json({ valid: false, error: 'Invalid referral UUID' }, { status: 400 })
    }

    return NextResponse.json({ valid: true, referrerId })
  } catch (error: any) {
    console.error('❌ Referral validate: Unexpected error:', error)
    return NextResponse.json({ valid: false, error: error.message || 'Validation failed' }, { status: 500 })
  }
}