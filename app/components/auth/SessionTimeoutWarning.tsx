'use client'

import { useState, useEffect } from 'react'
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'

interface SessionTimeoutWarningProps {
  onExtend?: () => void
  onRefresh?: () => void
  onDismiss?: () => void
  className?: string
}

export function SessionTimeoutWarning({
  onExtend,
  onRefresh,
  onDismiss,
  className = ''
}: SessionTimeoutWarningProps) {
  const {
    isWarningVisible,
    timeUntilTimeout,
    isRefreshing,
    extendSession,
    refreshSession,
    dismissWarning
  } = useSessionTimeout({
    onWarning: () => {
      // Warning is handled by the hook
    },
    onTimeout: () => {
      // Timeout is handled by the hook
    }
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(isWarningVisible)
  }, [isWarningVisible])

  const handleExtend = () => {
    extendSession()
    onExtend?.()
  }

  const handleRefresh = async () => {
    const success = await refreshSession()
    if (success) {
      onRefresh?.()
    }
  }

  const handleDismiss = () => {
    dismissWarning()
    onDismiss?.()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Your session will expire in{' '}
            <span className="font-semibold text-red-600">{timeUntilTimeout}</span>
          </p>
                      <p className="text-sm text-gray-500 mt-1">
              Click &quot;Stay Logged In&quot; to extend your session, or &quot;Refresh Session&quot; to get a new token.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExtend}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Stay Logged In
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
} 