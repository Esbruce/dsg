import { useEffect, useState, useCallback, useRef } from 'react'
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

  // Use refs to store callback functions to prevent infinite re-renders
  const onWarningRef = useRef(onWarning)
  const onTimeoutRef = useRef(onTimeout)
  const onRefreshRef = useRef(onRefresh)

  // Update refs when callbacks change
  useEffect(() => {
    onWarningRef.current = onWarning
  }, [onWarning])

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

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
    onWarningRef.current?.()
  }, [])

  // Handle timeout
  const handleTimeout = useCallback(async () => {
    setIsWarningVisible(false)
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    onTimeoutRef.current?.()
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    onRefreshRef.current?.()
  }, [])

  // Start session timeout manager
  const start = useCallback(() => {
    sessionTimeoutManager.start(handleWarning, handleTimeout, handleRefresh)
    setState(sessionTimeoutManager.getState())
  }, [])

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
  }, [autoStart, stop])

  // Format time for display - memoized to prevent unnecessary re-renders
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