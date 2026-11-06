import { createClient } from '@supabase/supabase-js'
import { env } from 'cloudflare:workers'

import type { Database } from '@/lib/supabase/database'

export function createAdminClient() {
  return createClient<Database>(import.meta.env.VITE_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
