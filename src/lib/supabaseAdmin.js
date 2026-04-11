import { createClient } from '@supabase/supabase-js'

/**
 * Superuser client for server-side logic only.
 * Bypasses RLS to ensure critical operations (like profiling) always succeed.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
