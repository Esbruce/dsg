'use client'

import { useEffect } from 'react'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'
import { useRouter } from 'next/navigation'

export function SessionTimeoutHandler() {
  const router = useRouter()

  // Initialize session timeout timers. On timeout, redirect to login with returnTo
  useSessionTimeout({
    onTimeout: () => {
      try {
        const currentPath = typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/'
        const encoded = encodeURIComponent(currentPath || '/')
        router.push(`/login?returnTo=${encoded}`)
      } catch (err) {
        // Fallback in case router fails for any reason
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search
          const encoded = encodeURIComponent(currentPath || '/')
          window.location.href = `/login?returnTo=${encoded}`
        }
      }
    }
  })

  // Render nothing; this is a headless handler.
  return null
}

