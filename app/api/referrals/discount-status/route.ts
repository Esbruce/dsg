import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // For now, return mock data
    return NextResponse.json({
      hasDiscount: false,
      discountPercentage: 0
    });
  } catch (error) {
    console.error('Discount status error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount status' }, { status: 500 });
  }
} 