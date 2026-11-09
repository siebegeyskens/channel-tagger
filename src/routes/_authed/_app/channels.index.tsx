import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Tags as TagsIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Message } from '@/components/message'
import { TagChip } from '@/components/tag-chip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isReauthError, signInWithGoogle } from '@/lib/auth'
import { channelsQueryOptions, youtubeChannelUrl, type Channel } from '@/lib/channels'
import { compareText } from '@/lib/compare'
import { useTagsByChannel, type Tag } from '@/lib/tags'

export const Route = createFileRoute('/_authed/_app/channels/')({ component: ChannelsPage })

const NO_TAGS: Tag[] = []

function ChannelsPage() {
  const { data, error, isPending, refetch, isRefetching } = useQuery(channelsQueryOptions)
  const tagsByChannel = useTagsByChannel()
  const channels = useMemo(() => data?.toSorted((a, b) => compareText(a.title, b.title)), [data])

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
        <ChannelRow
          key={channel.channelId}
          channel={channel}
          tags={tagsByChannel?.get(channel.channelId) ?? NO_TAGS}
        />
      ))}
    </ul>
  )
}

function ChannelRow({ channel, tags }: { channel: Channel; tags: Tag[] }) {
  return (
    <li className="flex items-center gap-1 pr-4 [contain-intrinsic-size:auto_64px] [content-visibility:auto]">
      <a
        href={youtubeChannelUrl(channel.channelId)}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-4 outline-none hover:bg-accent/50 focus-visible:bg-accent/50"
      >
        <Avatar className="size-10">
          {channel.thumbnailUrl && (
            <AvatarImage src={channel.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
          )}
          <AvatarFallback>{channel.title.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{channel.title}</p>
          {tags.length > 0 ? (
            <div className="mt-1 flex gap-1 overflow-hidden">
              {tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  name={tag.name}
                  color={tag.color}
                  size="sm"
                  className="shrink-0"
                />
              ))}
            </div>
          ) : (
            channel.handle && (
              <p className="truncate text-sm text-muted-foreground">{channel.handle}</p>
            )
          )}
        </div>
      </a>
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/channels/$channelId"
          params={{ channelId: channel.channelId }}
          aria-label={`Edit tags for ${channel.title}`}
        >
          <TagsIcon />
        </Link>
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
