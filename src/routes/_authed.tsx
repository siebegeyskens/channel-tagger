import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { supabase } from '@/lib/supabase/client'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/sign-in' })
    return { user: data.session.user }
  },
  component: Outlet,
})
