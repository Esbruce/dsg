// Simple test file for session timeout functionality
// Run with: npx tsx lib/auth/session-timeout.test.ts

import { SessionTimeoutManager } from './session-timeout'

// Test configuration (very short timeouts for testing)
const testConfig = {
  sessionTimeoutMs: 10 * 1000,    // 10 seconds
  warningTimeMs: 5 * 1000,        // 5 seconds warning
  refreshBufferMs: 8 * 1000,      // Refresh 8 seconds before expiry
  refreshIntervalMs: 2 * 1000     // Check every 2 seconds
}

async function testSessionTimeout() {
  console.log('🧪 Testing Session Timeout System...')
  
  const manager = new SessionTimeoutManager(testConfig)
  
  // Test 1: Start the manager
  console.log('✅ Test 1: Starting session manager')
  manager.start(
    () => console.log('⚠️  Warning triggered'),
    () => console.log('⏰ Timeout triggered'),
    () => console.log('🔄 Session refreshed')
  )
  
  // Test 2: Check initial state
  console.log('✅ Test 2: Checking initial state')
  const initialState = manager.getState()
  console.log('Initial state:', initialState)
  
  // Test 3: Update activity
  console.log('✅ Test 3: Updating activity')
  manager.updateActivity()
  const updatedState = manager.getState()
  console.log('Updated state:', updatedState)
  
  // Test 4: Wait for warning (should trigger after 5 seconds)
  console.log('✅ Test 4: Waiting for warning (5 seconds)...')
  await new Promise(resolve => setTimeout(resolve, 6000))
  
  // Test 5: Check state after warning
  const warningState = manager.getState()
  console.log('State after warning:', warningState)
  
  // Test 6: Extend session
  console.log('✅ Test 6: Extending session')
  manager.updateActivity()
  const extendedState = manager.getState()
  console.log('Extended state:', extendedState)
  
  // Test 7: Stop manager
  console.log('✅ Test 7: Stopping manager')
  manager.stop()
  
  console.log('🎉 All tests completed!')
  console.log('📝 Note: This is a basic test. In a real app, you would test with actual Supabase sessions.')
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSessionTimeout().catch(console.error)
}

export { testSessionTimeout } 