export interface SessionConfig {
  // Session timeout duration in milliseconds
  sessionTimeoutMs: number
  // Warning time before timeout (when to show warning)
  warningTimeMs: number
  // Refresh token before expiry (buffer time)
  refreshBufferMs: number
  // Auto refresh interval
  refreshIntervalMs: number
  // Maximum session duration (absolute limit)
  maxSessionDurationMs: number
  // Whether to show session status in UI
  showSessionStatus: boolean
  // Whether to auto-refresh sessions
  autoRefresh: boolean
  // Whether to show timeout warnings
  showWarnings: boolean
}

// Development configuration (shorter timeouts for testing)
export const devSessionConfig: SessionConfig = {
  sessionTimeoutMs: 15 * 60 * 1000,   // 15 minutes
  warningTimeMs: 2 * 60 * 1000,       // 2 minutes warning
  refreshBufferMs: 5 * 60 * 1000,     // Refresh 5 minutes before expiry
  refreshIntervalMs: 2 * 60 * 1000,   // Check every 2 minutes
  maxSessionDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  showSessionStatus: true,
  autoRefresh: true,
  showWarnings: true
}

// Production configuration
export const prodSessionConfig: SessionConfig = {
  sessionTimeoutMs: 15 * 60 * 1000,   // 15 minutes
  warningTimeMs: 2 * 60 * 1000,       // 2 minutes warning
  refreshBufferMs: 5 * 60 * 1000,     // Refresh 5 minutes before expiry
  refreshIntervalMs: 2 * 60 * 1000,   // Check every 2 minutes
  maxSessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  showSessionStatus: true,
  autoRefresh: true,
  showWarnings: true
}

// Get configuration based on environment
export function getSessionConfig(): SessionConfig {
  if (process.env.NODE_ENV === 'development') {
    return devSessionConfig
  }
  return prodSessionConfig
}

// Environment variable overrides
export function getCustomSessionConfig(): SessionConfig {
  const baseConfig = getSessionConfig()
  
  return {
    ...baseConfig,
    sessionTimeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS || baseConfig.sessionTimeoutMs.toString()),
    warningTimeMs: parseInt(process.env.SESSION_WARNING_MS || baseConfig.warningTimeMs.toString()),
    refreshBufferMs: parseInt(process.env.SESSION_REFRESH_BUFFER_MS || baseConfig.refreshBufferMs.toString()),
    refreshIntervalMs: parseInt(process.env.SESSION_REFRESH_INTERVAL_MS || baseConfig.refreshIntervalMs.toString()),
    maxSessionDurationMs: parseInt(process.env.SESSION_MAX_DURATION_MS || baseConfig.maxSessionDurationMs.toString()),
    showSessionStatus: process.env.SHOW_SESSION_STATUS !== 'false',
    autoRefresh: process.env.SESSION_AUTO_REFRESH !== 'false',
    showWarnings: process.env.SESSION_SHOW_WARNINGS !== 'false'
  }
} 