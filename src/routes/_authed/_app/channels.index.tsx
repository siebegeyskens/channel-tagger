import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Tags as TagsIcon } from 'lucide-react'
import { useMemo } from 'react'

import { FilterRow } from '@/components/channels/filter-row'
import { Message } from '@/components/message'
import { TagChipList } from '@/components/tag-chip-list'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isReauthError, signInWithGoogle } from '@/lib/auth'
import { UNTAGGED, matchesTagFilter, parseTagFilter } from '@/lib/channel-filters'
import { channelsQueryOptions, youtubeChannelUrl, type Channel } from '@/lib/channels'
import { compareText } from '@/lib/compare'
import { tagsQueryOptions, useTagsByChannel, type Tag } from '@/lib/tags'

export const Route = createFileRoute('/_authed/_app/channels/')({ component: ChannelsPage })

const NO_TAGS: Tag[] = []

function ChannelsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const channelsQuery = useQuery(channelsQueryOptions)
  const tagsQuery = useQuery(tagsQueryOptions)
  const tagsByChannel = useTagsByChannel()
  const sort = search.sort ?? 'az'
  const tags = tagsQuery.data?.tags ?? NO_TAGS
  const requested = parseTagFilter(search.tags)
  const waitingForTags = requested.length > 0 && !tagsQuery.data

  const selected = useMemo(() => {
    const known = new Set(tags.map((tag) => tag.id))
    return parseTagFilter(search.tags).filter((id) => id === UNTAGGED || known.has(id))
  }, [search.tags, tags])

  const channels = useMemo(() => {
    if (!channelsQuery.data) return undefined
    const filter = new Set(selected)
    const direction = sort === 'za' ? -1 : 1
    return channelsQuery.data
      .filter((channel) =>
        matchesTagFilter(
          (tagsByChannel?.get(channel.channelId) ?? NO_TAGS).map((tag) => tag.id),
          filter,
        ),
      )
      .toSorted((a, b) => direction * compareText(a.title, b.title))
  }, [channelsQuery.data, tagsByChannel, selected, sort])

  function clearFilters() {
    void navigate({ search: (prev) => ({ ...prev, tags: undefined }), replace: true })
  }

  function content() {
    if (channelsQuery.error) {
      return isReauthError(channelsQuery.error) ? (
        <Message text="Your YouTube access has expired. Sign in again to load your channels.">
          <Button onClick={() => signInWithGoogle()}>Sign in again</Button>
        </Message>
      ) : (
        <Message text="Couldn't load your channels.">
          <Button
            variant="secondary"
            onClick={() => channelsQuery.refetch()}
            disabled={channelsQuery.isRefetching}
          >
            Try again
          </Button>
        </Message>
      )
    }
    if (waitingForTags && tagsQuery.error) {
      return (
        <Message text="Couldn't load your tags.">
          <Button
            variant="secondary"
            onClick={() => tagsQuery.refetch()}
            disabled={tagsQuery.isRefetching}
          >
            Try again
          </Button>
        </Message>
      )
    }
    if (!channels || waitingForTags) return <ChannelListSkeleton />
    if (channelsQuery.data?.length === 0) {
      return <Message text="You're not subscribed to any channels on YouTube yet." />
    }
    if (channels.length === 0) {
      return (
        <Message text="No channels match these tags.">
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        </Message>
      )
    }
    return (
      <ul className="pb-2">
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

  return (
    <>
      <FilterRow tags={tags} selected={selected} sort={sort} />
      {content()}
    </>
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
            <TagChipList tags={tags} className="mt-1" />
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
    <ul className="pb-2" aria-busy="true" aria-label="Loading channels">
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
