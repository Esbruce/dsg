import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl

  // Allow public access to /confirm and /error
  if (
    pathname.startsWith('/confirm') ||
    pathname.startsWith('/error')
  ) {
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

