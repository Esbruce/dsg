import { useEffect, useState, useCallback } from 'react'
import { sessionTimeoutManager, SessionTimeoutState } from '@/lib/auth/session-timeout'
import { createClient } from '@/lib/supabase/client'

export interface UseSessionTimeoutOptions {
  onWarning?: () => void
  onTimeout?: () => void
  onRefresh?: () => void
  autoStart?: boolean
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const [state, setState] = useState<SessionTimeoutState>(sessionTimeoutManager.getState())
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    onWarning,
    onTimeout,
    onRefresh,
    autoStart = true
  } = options

  // Update state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setState(sessionTimeoutManager.getState())
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  // Handle warning
  const handleWarning = useCallback(() => {
    setIsWarningVisible(true)
    onWarning?.()
  }, [onWarning])

  // Handle timeout
  const handleTimeout = useCallback(async () => {
    setIsWarningVisible(false)
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    onTimeout?.()
  }, [onTimeout])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    onRefresh?.()
  }, [onRefresh])

  // Start session timeout manager
  const start = useCallback(() => {
    sessionTimeoutManager.start(handleWarning, handleTimeout, handleRefresh)
    setState(sessionTimeoutManager.getState())
  }, [handleWarning, handleTimeout, handleRefresh])

  // Stop session timeout manager
  const stop = useCallback(() => {
    sessionTimeoutManager.stop()
    setState(sessionTimeoutManager.getState())
  }, [])

  // Manually refresh session
  const refreshSession = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const success = await sessionTimeoutManager.refreshSession()
      if (success) {
        setIsWarningVisible(false)
        setState(sessionTimeoutManager.getState())
      }
      return success
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Extend session (reset timers)
  const extendSession = useCallback(() => {
    sessionTimeoutManager.updateActivity()
    setIsWarningVisible(false)
    setState(sessionTimeoutManager.getState())
  }, [])

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      start()
    }

    return () => {
      stop()
    }
  }, [autoStart, start, stop])

  // Format time for display
  const formatTime = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  return {
    // State
    state,
    isWarningVisible,
    isRefreshing,
    
    // Computed values
    timeUntilTimeout: formatTime(state.timeUntilTimeout),
    timeUntilWarning: formatTime(state.timeUntilWarning),
    shouldShowWarning: state.shouldShowWarning,
    
    // Actions
    start,
    stop,
    refreshSession,
    extendSession,
    dismissWarning: () => setIsWarningVisible(false)
  }
} 