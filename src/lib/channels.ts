import { queryOptions } from '@tanstack/react-query'

import { isReauthError } from '@/lib/auth'
import { getChannels } from '@/server/channels'

export interface Channel {
  channelId: string
  title: string
  handle: string | null
  thumbnailUrl: string | null
}

export const channelsQueryOptions = queryOptions({
  queryKey: ['channels'],
  queryFn: () => getChannels(),
  staleTime: 60 * 60 * 1000,
  retry: (failureCount, error) => !isReauthError(error) && failureCount < 2,
})

export function youtubeChannelUrl(channelId: string) {
  return `https://www.youtube.com/channel/${channelId}`
}
