import { createServerFn } from '@tanstack/react-start'

import { REAUTH_REQUIRED } from '@/lib/auth'
import type { Channel } from '@/lib/channels'

import { authMiddleware } from './auth-middleware'
import { forgetGoogleAccessToken, getGoogleAccessToken } from './google-token'

interface Thumbnails {
  default?: { url: string }
}

interface SubscriptionsPage {
  nextPageToken?: string
  items: {
    snippet: { title: string; resourceId: { channelId: string }; thumbnails?: Thumbnails }
  }[]
}

interface ChannelsPage {
  items?: { id: string; snippet: { customUrl?: string; thumbnails?: Thumbnails } }[]
}

const SCOPE_ERRORS = new Set(['insufficientPermissions', 'ACCESS_TOKEN_SCOPE_INSUFFICIENT'])

async function youtube<T>(
  userId: string,
  token: string,
  resource: string,
  params: Record<string, string>,
) {
  const url = `https://www.googleapis.com/youtube/v3/${resource}?${new URLSearchParams(params)}`
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (response.ok) return (await response.json()) as T

  const body = (await response.json().catch(() => null)) as {
    error?: { errors?: { reason?: string }[]; details?: { reason?: string }[] }
  } | null
  const reasons = [...(body?.error?.errors ?? []), ...(body?.error?.details ?? [])].map(
    (entry) => entry.reason,
  )
  if (response.status === 401 || reasons.some((reason) => reason && SCOPE_ERRORS.has(reason))) {
    forgetGoogleAccessToken(userId)
    throw new Error(REAUTH_REQUIRED)
  }
  throw new Error(`YouTube request failed (${response.status})`)
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  )
}

export const getChannels = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Channel[]> => {
    const token = await getGoogleAccessToken(context.userId)

    const subscriptions: SubscriptionsPage['items'] = []
    let pageToken: string | undefined
    do {
      const page = await youtube<SubscriptionsPage>(context.userId, token, 'subscriptions', {
        part: 'snippet',
        mine: 'true',
        maxResults: '50',
        ...(pageToken ? { pageToken } : {}),
      })
      subscriptions.push(...page.items)
      pageToken = page.nextPageToken
    } while (pageToken)

    const ids = subscriptions.map((item) => item.snippet.resourceId.channelId)
    const pages = await Promise.all(
      chunk(ids, 50).map((batch) =>
        youtube<ChannelsPage>(context.userId, token, 'channels', {
          part: 'snippet',
          id: batch.join(','),
          maxResults: '50',
        }),
      ),
    )
    const details = new Map(
      pages.flatMap((page) => page.items ?? []).map((item) => [item.id, item]),
    )

    return subscriptions.map(({ snippet }) => {
      const channelId = snippet.resourceId.channelId
      const channel = details.get(channelId)
      return {
        channelId,
        title: snippet.title,
        handle: channel?.snippet.customUrl ?? null,
        thumbnailUrl:
          channel?.snippet.thumbnails?.default?.url ?? snippet.thumbnails?.default?.url ?? null,
      }
    })
  })
