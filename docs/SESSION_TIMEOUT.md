# Session Timeout System

## Overview

The session timeout system provides automatic session management, including timeout detection, warnings, and automatic refresh capabilities. This ensures security while maintaining a good user experience.

## Features

### ✅ **Automatic Session Management**
- **Session Timeout**: Automatically logs out users after inactivity
- **Warning System**: Shows warnings before session expires
- **Auto Refresh**: Refreshes sessions before they expire
- **Activity Detection**: Monitors user activity to extend sessions

### ✅ **User Experience**
- **Visual Warnings**: Modal dialogs with countdown timers
- **Session Status**: Real-time session status indicators
- **Graceful Logout**: Automatic logout with proper cleanup
- **Extend Options**: Users can extend sessions manually

### ✅ **Security**
- **Configurable Timeouts**: Different timeouts for dev/prod
- **Middleware Protection**: Server-side session validation
- **Cookie Cleanup**: Automatic cleanup of expired sessions
- **Activity Monitoring**: Tracks user activity patterns

## Configuration

### Environment Variables

```env
# Session timeout duration (milliseconds)
SESSION_TIMEOUT_MS=1800000

# Warning time before timeout (milliseconds)
SESSION_WARNING_MS=300000

# Refresh buffer time (milliseconds)
SESSION_REFRESH_BUFFER_MS=600000

# Auto refresh interval (milliseconds)
SESSION_REFRESH_INTERVAL_MS=300000

# Maximum session duration (milliseconds)
SESSION_MAX_DURATION_MS=604800000

# Show session status in UI
SHOW_SESSION_STATUS=true

# Enable auto refresh
SESSION_AUTO_REFRESH=true

# Show timeout warnings
SESSION_SHOW_WARNINGS=true
```

### Default Configurations

| Environment | Timeout | Warning | Refresh Buffer | Check Interval |
|-------------|---------|---------|----------------|----------------|
| **Development** | 5 minutes | 1 minute | 2 minutes | 1 minute |
| **Production** | 30 minutes | 5 minutes | 10 minutes | 5 minutes |

## Components

### 1. SessionTimeoutManager

The core class that manages session timeouts:

```typescript
import { sessionTimeoutManager } from '@/lib/auth/session-timeout'

// Start session monitoring
sessionTimeoutManager.start(
  () => console.log('Warning triggered'),
  () => console.log('Timeout triggered'),
  () => console.log('Session refreshed')
)

// Update activity
sessionTimeoutManager.updateActivity()

// Get current state
const state = sessionTimeoutManager.getState()
```

### 2. useSessionTimeout Hook

React hook for session timeout management:

```typescript
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout'

function MyComponent() {
  const {
    state,
    timeUntilTimeout,
    isWarningVisible,
    extendSession,
    refreshSession
  } = useSessionTimeout({
    onWarning: () => console.log('Warning!'),
    onTimeout: () => console.log('Timed out!'),
    onRefresh: () => console.log('Refreshed!')
  })

  return (
    <div>
      <p>Time remaining: {timeUntilTimeout}</p>
      <button onClick={extendSession}>Extend Session</button>
    </div>
  )
}
```

### 3. SessionTimeoutWarning Component

Modal warning component:

```typescript
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning'

function App() {
  return (
    <div>
      {/* Your app content */}
      <SessionTimeoutWarning />
    </div>
  )
}
```

### 4. SessionStatus Component

Status indicator component:

```typescript
import { SessionStatus } from '@/components/auth/SessionStatus'

function Header() {
  return (
    <header>
      <SessionStatus showTimeRemaining={true} />
    </header>
  )
}
```

## Implementation Details

### Activity Detection

The system monitors these user activities:
- Mouse movements
- Mouse clicks
- Keyboard input
- Touch events
- Scrolling
- Page interactions

### Session Refresh Logic

1. **Check Session**: Every 5 minutes (configurable)
2. **Calculate Expiry**: Check if session expires soon
3. **Refresh if Needed**: Refresh 10 minutes before expiry
4. **Update Activity**: Reset activity timers
5. **Handle Errors**: Logout if refresh fails

### Warning System

1. **Warning Trigger**: 5 minutes before timeout
2. **Modal Display**: Show warning with countdown
3. **User Options**: Extend, refresh, or dismiss
4. **Auto Dismiss**: Hide if user extends session

### Middleware Integration

The middleware automatically:
- Validates sessions on each request
- Refreshes sessions before expiry
- Cleans up invalid cookies
- Redirects unauthenticated users

## Usage Examples

### Basic Implementation

```typescript
// In your main layout
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning'

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <SessionTimeoutWarning />
    </div>
  )
}
```

### Custom Configuration

```typescript
import { SessionTimeoutManager } from '@/lib/auth/session-timeout'

const customManager = new SessionTimeoutManager({
  sessionTimeoutMs: 60 * 60 * 1000, // 1 hour
  warningTimeMs: 10 * 60 * 1000,    // 10 minutes
  refreshBufferMs: 15 * 60 * 1000,  // 15 minutes
  refreshIntervalMs: 5 * 60 * 1000  // 5 minutes
})
```

### Manual Session Management

```typescript
import { sessionTimeoutManager } from '@/lib/auth/session-timeout'

// Start monitoring
sessionTimeoutManager.start()

// Check if session is active
const state = sessionTimeoutManager.getState()
if (state.isActive) {
  console.log('Session is active')
}

// Manually refresh
const success = await sessionTimeoutManager.refreshSession()
```

## Security Considerations

### 1. Session Validation
- Server-side session checks in middleware
- Automatic cleanup of expired sessions
- Protection against session hijacking

### 2. Activity Monitoring
- Tracks genuine user activity
- Prevents session extension through automation
- Configurable activity thresholds

### 3. Graceful Degradation
- Fail-open design for availability
- Automatic logout on security issues
- Proper error handling and logging

## Troubleshooting

### Common Issues

1. **Sessions Expiring Too Quickly**
   - Check `SESSION_TIMEOUT_MS` configuration
   - Verify activity detection is working
   - Check browser console for errors

2. **Warnings Not Showing**
   - Ensure `SESSION_SHOW_WARNINGS=true`
   - Check if `SessionTimeoutWarning` is mounted
   - Verify warning timing configuration

3. **Auto Refresh Not Working**
   - Check `SESSION_AUTO_REFRESH=true`
   - Verify Supabase connection
   - Check refresh buffer configuration

4. **Middleware Errors**
   - Check Supabase service role key
   - Verify cookie configuration
   - Check network connectivity

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
```

This will show detailed session management logs in the console.

## Performance Optimization

### 1. Efficient Timers
- Uses `setInterval` for refresh checks
- Cleans up timers on component unmount
- Optimized activity detection

### 2. Minimal Re-renders
- State updates only when necessary
- Debounced activity tracking
- Efficient React hooks usage

### 3. Memory Management
- Automatic cleanup of expired sessions
- Proper event listener cleanup
- Garbage collection friendly

## Production Deployment

### 1. Environment Setup

```env
# Production session settings
SESSION_TIMEOUT_MS=1800000
SESSION_WARNING_MS=300000
SESSION_REFRESH_BUFFER_MS=600000
SESSION_AUTO_REFRESH=true
SHOW_SESSION_STATUS=true
```

### 2. Monitoring

Monitor these metrics:
- Session refresh success rate
- Warning dismissal rate
- Session timeout frequency
- User activity patterns

### 3. Scaling Considerations

- Session data is stored in Supabase
- No server-side state management
- Scales across multiple instances
- Works with load balancers

## Migration Guide

### From No Session Management

1. **Install Components**: Add session timeout components
2. **Configure Environment**: Set session timeout variables
3. **Update Layout**: Add `SessionTimeoutWarning` to layout
4. **Test Functionality**: Verify warnings and timeouts work

### From Manual Session Management

1. **Replace Manual Logic**: Use `useSessionTimeout` hook
2. **Update Components**: Replace manual timers with hook
3. **Configure Settings**: Use environment variables
4. **Test Integration**: Verify automatic management works

## API Reference

### SessionTimeoutManager

```typescript
class SessionTimeoutManager {
  start(onWarning?, onTimeout?, onRefresh?): void
  stop(): void
  updateActivity(): void
  getState(): SessionTimeoutState
  refreshSession(): Promise<boolean>
}
```

### useSessionTimeout Hook

```typescript
function useSessionTimeout(options): {
  state: SessionTimeoutState
  timeUntilTimeout: string
  isWarningVisible: boolean
  extendSession: () => void
  refreshSession: () => Promise<boolean>
}
```

### SessionTimeoutState

```typescript
interface SessionTimeoutState {
  isActive: boolean
  timeUntilTimeout: number
  timeUntilWarning: number
  shouldShowWarning: boolean
  lastActivity: number
}
```

The session timeout system is now fully integrated and ready to protect your application! 🛡️ 