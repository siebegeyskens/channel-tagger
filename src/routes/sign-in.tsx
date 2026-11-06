import { createFileRoute, redirect } from '@tanstack/react-router'
import { MonitorPlay } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/lib/auth'
import { supabase } from '@/lib/supabase/client'

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: '/channels' })
  },
  component: SignInPage,
})

function SignInPage() {
  const { error } = Route.useSearch()
  const [pending, setPending] = useState(false)

  async function handleSignIn() {
    setPending(true)
    const { error: signInError } = await signInWithGoogle()
    if (signInError) setPending(false)
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
      <MonitorPlay className="size-10" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Channel Tagger</h1>
        <p className="text-muted-foreground">
          Organize the YouTube channels you follow with your own tags.
        </p>
      </div>
      <Button size="lg" onClick={handleSignIn} disabled={pending}>
        Sign in with Google
      </Button>
      {error && <p className="text-sm text-destructive">Sign-in didn't work. Please try again.</p>}
      <p className="text-sm text-muted-foreground">
        Only reads which channels you're subscribed to.
      </p>
    </main>
  )
}
