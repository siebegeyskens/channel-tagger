import { env } from 'cloudflare:workers'

import { REAUTH_REQUIRED } from '@/lib/auth'

import { createAdminClient } from './supabase-admin'

const accessTokens = new Map<string, { token: string; expiresAt: number }>()

export async function storeGoogleRefreshToken(userId: string, refreshToken: string) {
  const { error } = await createAdminClient().from('google_tokens').upsert({
    user_id: userId,
    refresh_token: refreshToken,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    console.error('Saving Google token failed', error)
    throw new Error('Could not save Google token')
  }
  accessTokens.delete(userId)
}

export function forgetGoogleAccessToken(userId: string) {
  accessTokens.delete(userId)
}

export async function getGoogleAccessToken(userId: string) {
  const cached = accessTokens.get(userId)
  if (cached && cached.expiresAt > Date.now()) return cached.token

  const { data, error } = await createAdminClient()
    .from('google_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('Reading Google token failed', error)
    throw new Error('Could not read Google token')
  }
  if (!data) throw new Error(REAUTH_REQUIRED)

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  const body = (await response.json()) as {
    access_token?: string
    expires_in?: number
    error?: string
  }
  if (body.error === 'invalid_grant') throw new Error(REAUTH_REQUIRED)
  if (!response.ok || !body.access_token) {
    console.error('Refreshing Google token failed', response.status, body.error)
    throw new Error('Could not refresh Google token')
  }

  const expiresAt = Date.now() + ((body.expires_in ?? 3600) - 60) * 1000
  accessTokens.set(userId, { token: body.access_token, expiresAt })
  return body.access_token
}
