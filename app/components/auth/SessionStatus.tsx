'use client'

import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'

interface SessionStatusProps {
  showTimeRemaining?: boolean
  className?: string
}

export function SessionStatus({ 
  showTimeRemaining = true, 
  className = '' 
}: SessionStatusProps) {
  const {
    state,
    timeUntilTimeout,
    shouldShowWarning,
    extendSession
  } = useSessionTimeout()

  if (!state.isActive) {
    return null
  }

  const getStatusColor = () => {
    if (shouldShowWarning) return 'text-red-600'
    if (state.timeUntilTimeout < 10 * 60 * 1000) return 'text-yellow-600' // Less than 10 minutes
    return 'text-green-600'
  }

  const getStatusText = () => {
    if (shouldShowWarning) return 'Session expiring soon'
    if (state.timeUntilTimeout < 10 * 60 * 1000) return 'Session active'
    return 'Session active'
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full ${shouldShowWarning ? 'bg-red-500' : 'bg-green-500'}`} />
        <span className="font-medium">{getStatusText()}</span>
      </div>
      
      {showTimeRemaining && (
        <>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">
            {timeUntilTimeout} remaining
          </span>
        </>
      )}
      
      {shouldShowWarning && (
        <button
          onClick={extendSession}
          className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
        >
          Extend
        </button>
      )}
    </div>
  )
} 