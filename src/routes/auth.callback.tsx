import { createFileRoute, redirect } from '@tanstack/react-router'

import { supabase } from '@/lib/supabase/client'
import { saveGoogleToken } from '@/server/auth'

export const Route = createFileRoute('/auth/callback')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session) throw redirect({ to: '/sign-in', search: { error: 'callback' } })

    if (session.provider_refresh_token) {
      try {
        await saveGoogleToken({ data: { refreshToken: session.provider_refresh_token } })
      } catch {
        await supabase.auth.signOut()
        throw redirect({ to: '/sign-in', search: { error: 'callback' } })
      }
      await supabase.auth.refreshSession()
    }
    throw redirect({ to: '/channels', replace: true })
  },
})
