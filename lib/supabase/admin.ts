import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) return cachedAdminClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is required');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  }

  cachedAdminClient = createClient(supabaseUrl, serviceRoleKey);
  return cachedAdminClient;
}

// Backwards-compatible proxy so existing imports `supabaseAdmin` keep working
// without creating the client at module import time. The real client is
// created on first property access.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    return Reflect.get(client as unknown as object, prop, receiver);
  },
  set(_target, prop, value) {
    const client = getSupabaseAdmin();
    return Reflect.set(client as unknown as object, prop, value);
  },
}) as SupabaseClient;

