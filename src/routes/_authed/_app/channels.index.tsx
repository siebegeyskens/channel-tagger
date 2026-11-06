import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useMemo } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isReauthError, signInWithGoogle } from '@/lib/auth'
import { channelsQueryOptions, youtubeChannelUrl, type Channel } from '@/lib/channels'

export const Route = createFileRoute('/_authed/_app/channels/')({ component: ChannelsPage })

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

function ChannelsPage() {
  const { data, error, isPending, refetch, isRefetching } = useQuery(channelsQueryOptions)
  const channels = useMemo(
    () => data?.toSorted((a, b) => collator.compare(a.title, b.title)),
    [data],
  )

  if (isPending) return <ChannelListSkeleton />

  if (error) {
    return isReauthError(error) ? (
      <Message text="Your YouTube access has expired. Sign in again to load your channels.">
        <Button onClick={() => signInWithGoogle()}>Sign in again</Button>
      </Message>
    ) : (
      <Message text="Couldn't load your channels.">
        <Button variant="secondary" onClick={() => refetch()} disabled={isRefetching}>
          Try again
        </Button>
      </Message>
    )
  }

  if (!channels?.length) {
    return <Message text="You're not subscribed to any channels on YouTube yet." />
  }

  return (
    <ul className="py-2">
      {channels.map((channel) => (
        <ChannelRow key={channel.channelId} channel={channel} />
      ))}
    </ul>
  )
}

function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <li className="flex items-center gap-3 px-4 py-2 [contain-intrinsic-size:auto_56px] [content-visibility:auto]">
      <Avatar className="size-10">
        {channel.thumbnailUrl && (
          <AvatarImage src={channel.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
        )}
        <AvatarFallback>{channel.title.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{channel.title}</p>
        {channel.handle && (
          <p className="truncate text-sm text-muted-foreground">{channel.handle}</p>
        )}
      </div>
      <Button variant="ghost" size="icon" asChild>
        <a
          href={youtubeChannelUrl(channel.channelId)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${channel.title} on YouTube`}
        >
          <ExternalLink />
        </a>
      </Button>
    </li>
  )
}

function ChannelListSkeleton() {
  return (
    <ul className="py-2" aria-busy="true" aria-label="Loading channels">
      {Array.from({ length: 10 }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-4 py-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Message({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
      <p className="text-muted-foreground">{text}</p>
      {children}
    </div>
  )
}
