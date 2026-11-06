import { supabase } from './supabase/client'

export const REAUTH_REQUIRED = 'REAUTH_REQUIRED'

export function isReauthError(error: unknown) {
  return error instanceof Error && error.message === REAUTH_REQUIRED
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/youtube.readonly',
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}
