'use client'

import { useEffect } from 'react'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'

export function SessionTimeoutHandler() {
  // Initialize session timeout timers. This will auto sign out on inactivity timeout.
  useSessionTimeout()

  // Render nothing; this is a headless handler.
  return null
}

