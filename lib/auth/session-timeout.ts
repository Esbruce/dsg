import { createClient } from '@/lib/supabase/client'
import { getCustomSessionConfig, SessionConfig } from '@/lib/config/session'

export interface SessionTimeoutConfig {
  // Session timeout duration in milliseconds
  sessionTimeoutMs: number
  // Warning time before timeout (when to show warning)
  warningTimeMs: number
  // Refresh token before expiry (buffer time)
  refreshBufferMs: number
  // Auto refresh interval
  refreshIntervalMs: number
}

export interface SessionTimeoutState {
  isActive: boolean
  timeUntilTimeout: number
  timeUntilWarning: number
  shouldShowWarning: boolean
  lastActivity: number
}

export class SessionTimeoutManager {
  private config: SessionTimeoutConfig
  private refreshTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private timeoutTimer: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private isActive: boolean = false
  private onWarning?: () => void
  private onTimeout?: () => void
  private onRefresh?: () => void

  constructor(config: SessionTimeoutConfig) {
    this.config = config
    this.setupActivityListeners()
  }

  /**
   * Start the session timeout manager
   */
  start(onWarning?: () => void, onTimeout?: () => void, onRefresh?: () => void): void {
    this.onWarning = onWarning
    this.onTimeout = onTimeout
    this.onRefresh = onRefresh
    this.isActive = true
    this.lastActivity = Date.now()
    
    this.scheduleRefresh()
    this.scheduleWarning()
    this.scheduleTimeout()
  }

  /**
   * Stop the session timeout manager
   */
  stop(): void {
    this.isActive = false
    this.clearAllTimers()
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    this.lastActivity = Date.now()
  }

  /**
   * Get current session state
   */
  getState(): SessionTimeoutState {
    const now = Date.now()
    const timeSinceActivity = now - this.lastActivity
    const timeUntilTimeout = Math.max(0, this.config.sessionTimeoutMs - timeSinceActivity)
    const timeUntilWarning = Math.max(0, this.config.warningTimeMs - timeSinceActivity)
    
    return {
      isActive: this.isActive,
      timeUntilTimeout,
      timeUntilWarning,
      shouldShowWarning: timeUntilWarning <= 0 && timeUntilTimeout > 0,
      lastActivity: this.lastActivity
    }
  }

  /**
   * Manually refresh the session
   */
  async refreshSession(): Promise<boolean> {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // If there's an actual error fetching the session, log and stop.
      if (error) {
        console.error('Session refresh error on getSession:', error)
        return false
      }

      // If no session exists (user not authenticated or not hydrated yet),
      // treat as a no-op instead of an error to avoid noisy logs.
      if (!session) {
        return false
      }

      // Check if session is close to expiry
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      if (timeUntilExpiry <= this.config.refreshBufferMs) {
        // Session is close to expiry, refresh it
        const { data, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('Session refresh error:', refreshError)
          return false
        }

        if (data.session) {
          console.log('Session refreshed successfully')
          this.updateActivity()
          this.onRefresh?.()
          return true
        }
      } else {
        // Session is still valid, just update activity
        this.updateActivity()
        return true
      }

      return false
    } catch (error) {
      console.error('Session refresh error:', error)
      return false
    }
  }

  /**
   * Setup activity listeners to detect user activity
   */
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ]

    const handleActivity = () => {
      this.updateActivity()
    }

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.stop()
    })
  }

  /**
   * Schedule automatic session refresh
   */
  private scheduleRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    this.refreshTimer = setInterval(async () => {
      if (!this.isActive) return

      const success = await this.refreshSession()
      if (!success) {
        // Refresh failed, trigger timeout
        this.handleTimeout()
      }
    }, this.config.refreshIntervalMs)
  }

  /**
   * Schedule warning before timeout
   */
  private scheduleWarning(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }

    const warningDelay = this.config.sessionTimeoutMs - this.config.warningTimeMs
    this.warningTimer = setTimeout(() => {
      if (!this.isActive) return
      this.handleWarning()
    }, warningDelay)
  }

  /**
   * Schedule session timeout
   */
  private scheduleTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }

    this.timeoutTimer = setTimeout(() => {
      if (!this.isActive) return
      this.handleTimeout()
    }, this.config.sessionTimeoutMs)
  }

  /**
   * Handle warning before timeout
   */
  private handleWarning(): void {
    console.log('Session timeout warning')
    this.onWarning?.()
  }

  /**
   * Handle session timeout
   */
  private handleTimeout(): void {
    console.log('Session timeout')
    this.stop()
    this.onTimeout?.()
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
    }
  }
}

// Get configuration from environment
const sessionConfig = getCustomSessionConfig()

// Default configuration
export const defaultSessionConfig: SessionTimeoutConfig = {
  sessionTimeoutMs: sessionConfig.sessionTimeoutMs,
  warningTimeMs: sessionConfig.warningTimeMs,
  refreshBufferMs: sessionConfig.refreshBufferMs,
  refreshIntervalMs: sessionConfig.refreshIntervalMs
}

// Create default session timeout manager
export const sessionTimeoutManager = new SessionTimeoutManager(defaultSessionConfig) 