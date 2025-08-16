import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')

  return createBrowserClient(
    supabaseUrl,
    anonKey
  )
}

