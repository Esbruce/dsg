import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {

  const { pathname, searchParams } = request.nextUrl

  // Allow public access to /confirm and /error
  if (
    pathname.startsWith('/confirm') ||
    pathname.startsWith('/error') ||
    pathname.startsWith('/api/stripe/webhook')
  ) {
    return NextResponse.next()
  }

  // Skip session validation for checkout redirects to prevent sign-out issues
  // When Stripe redirects back to our app, cookies might be temporarily unavailable
  // causing the middleware to think the user is not authenticated
  if (searchParams.has('checkout')) {
    console.log('🔄 Checkout redirect detected, skipping session validation');
    return NextResponse.next()
  }

  // For all other routes, run the session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

