import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'

import { supabase } from '@/lib/supabase/client'

import { createAdminClient } from './supabase-admin'

export const authMiddleware = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} })
  })
  .server(async ({ next }) => {
    const token = getRequestHeader('authorization')?.replace(/^Bearer /, '')
    if (!token) throw new Error('Unauthorized')
    const { data, error } = await createAdminClient().auth.getClaims(token)
    if (error || !data) throw new Error('Unauthorized')
    return next({ context: { userId: data.claims.sub } })
  })
