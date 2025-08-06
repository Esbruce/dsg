import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Check for session timeout or authentication errors
  if (authError) {
    // Don't log or handle "Auth session missing!" errors - this is normal for unauthenticated users
    if (authError.message !== 'Auth session missing!') {
      console.error('Auth error in middleware:', authError)
      
      // Only clear cookies if it's a genuine auth error, not a temporary redirect issue
      // This prevents clearing cookies during Stripe redirects
      supabaseResponse.cookies.delete('sb-access-token')
      supabaseResponse.cookies.delete('sb-refresh-token')
    }
  }

  // Only protect specific routes that require authentication
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/billing') ||
     request.nextUrl.pathname.startsWith('/settings'))
  ) {
    // Redirect to main page where LoginModal will be triggered
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Check if user session is expired (15-minute timeout)
  if (user) {
    const session = await supabase.auth.getSession()
    if (session.data.session) {
      const expiresAt = session.data.session.expires_at
      const now = Math.floor(Date.now() / 1000)
      
      // 10 minutes = 600 seconds
      const sessionTimeout = 600
      
      // If session expires in less than 10 minutes, refresh it
      if (expiresAt && (expiresAt - now) < sessionTimeout) {
        try {
          console.log('🔄 Session expiring soon, refreshing...');
          await supabase.auth.refreshSession()
        } catch (error) {
          console.error('Session refresh error in middleware:', error)
          
          // If refresh fails, clear the session (user will need to log in again)
          supabaseResponse.cookies.delete('sb-access-token')
          supabaseResponse.cookies.delete('sb-refresh-token')
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}