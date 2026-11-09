import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { SubPageHeader } from '@/components/layout/sub-page-header'
import { Message } from '@/components/message'
import { TagChip } from '@/components/tag-chip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Channel } from '@/lib/channels'
import { tagsQueryOptions, useChannelsByTag, type Tag } from '@/lib/tags'

export const Route = createFileRoute('/_authed/tags/')({ component: ManageTagsPage })

function ManageTagsPage() {
  const { data, error, isPending, refetch, isRefetching } = useQuery(tagsQueryOptions)
  const channelsByTag = useChannelsByTag()

  return (
    <main className="mx-auto max-w-[640px] pb-28">
      <SubPageHeader title="Manage tags" />
      {isPending ? (
        <TagListSkeleton />
      ) : error ? (
        <Message text="Couldn't load your tags.">
          <Button variant="secondary" onClick={() => refetch()} disabled={isRefetching}>
            Try again
          </Button>
        </Message>
      ) : data.tags.length === 0 ? (
        <Message text="Tags group your channels by topic, like Skate, Cycling or Programming, so you can filter your list by them.">
          <Button asChild>
            <Link to="/tags/new">Create your first tag</Link>
          </Button>
        </Message>
      ) : (
        <>
          <ul className="py-2">
            {data.tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                channels={channelsByTag && (channelsByTag.get(tag.id) ?? [])}
              />
            ))}
          </ul>
          <div className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto flex max-w-[640px] justify-end p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <Button
              size="icon"
              className="pointer-events-auto size-14 rounded-full shadow-lg"
              asChild
            >
              <Link to="/tags/new" aria-label="Create tag">
                <Plus className="size-6" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </main>
  )
}

function TagRow({ tag, channels }: { tag: Tag; channels: Channel[] | undefined }) {
  return (
    <li>
      <Link
        to="/tags/$tagId"
        params={{ tagId: tag.id }}
        className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
      >
        <TagChip name={tag.name} color={tag.color} className="min-w-0" />
        <span className="flex-1" />
        {channels && <ChannelStack channels={channels} />}
      </Link>
    </li>
  )
}

function ChannelStack({ channels }: { channels: Channel[] }) {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <span className="flex -space-x-2" aria-hidden="true">
        {channels.slice(0, 5).map((channel) => (
          <Avatar key={channel.channelId} className="size-7 ring-2 ring-background">
            {channel.thumbnailUrl && (
              <AvatarImage src={channel.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
            )}
            <AvatarFallback className="text-xs">
              {channel.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </span>
      <span className="min-w-6 text-right text-sm text-muted-foreground tabular-nums">
        <span className="sr-only">Channels: </span>
        {channels.length}
      </span>
    </span>
  )
}

function TagListSkeleton() {
  return (
    <ul className="py-2" aria-busy="true" aria-label="Loading tags">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="flex min-h-14 items-center gap-3 px-4 py-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <span className="flex-1" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  )
}
