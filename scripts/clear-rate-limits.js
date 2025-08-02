// Script to clear rate limits for testing
const { createClient } = require('@supabase/supabase-js')

async function clearRateLimits() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🧹 Clearing rate limits...')
    
    const { data, error } = await supabase
      .from('rate_limits')
      .delete()
      .neq('id', 0) // Delete all records

    if (error) {
      console.error('❌ Error clearing rate limits:', error)
      return
    }

    console.log('✅ Rate limits cleared successfully!')
    console.log(`Deleted ${data?.length || 0} rate limit records`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
clearRateLimits() 