import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useBlocker } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { CreateTagDialog } from '@/components/create-tag-dialog'
import { SubPageHeader } from '@/components/layout/sub-page-header'
import { Message } from '@/components/message'
import { TagToggle } from '@/components/tag-toggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { channelsQueryOptions, youtubeChannelUrl, type Channel } from '@/lib/channels'
import { tagsQueryOptions, useUpdateChannelTags, type Tag } from '@/lib/tags'
import { useGoBack } from '@/lib/use-go-back'

export const Route = createFileRoute('/_authed/channels/$channelId')({
  component: SelectTagsPage,
})

function SelectTagsPage() {
  const { channelId } = Route.useParams()
  const channels = useQuery(channelsQueryOptions)
  const tags = useQuery(tagsQueryOptions)
  const channel = channels.data?.find((candidate) => candidate.channelId === channelId)
  const initialTagIds = useMemo(
    () =>
      tags.data?.channelTags
        .filter((row) => row.channel_id === channelId)
        .map((row) => row.tag_id) ?? [],
    [tags.data, channelId],
  )

  function content() {
    if (channels.error || tags.error) {
      return (
        <Message text="Couldn't load this channel.">
          <Button
            variant="secondary"
            onClick={() => {
              void channels.refetch()
              void tags.refetch()
            }}
            disabled={channels.isRefetching || tags.isRefetching}
          >
            Try again
          </Button>
        </Message>
      )
    }
    if (!channels.data || !tags.data) return <SelectTagsSkeleton />
    if (!channel) {
      return (
        <Message text="You're not subscribed to this channel.">
          <Button variant="secondary" asChild>
            <Link to="/channels">Back to channels</Link>
          </Button>
        </Message>
      )
    }
    return (
      <SelectTagsForm
        key={channel.channelId}
        channel={channel}
        tags={tags.data.tags}
        initialTagIds={initialTagIds}
      />
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col">
      <SubPageHeader title="Select tags" />
      {content()}
    </main>
  )
}

function SelectTagsForm({
  channel,
  tags,
  initialTagIds,
}: {
  channel: Channel
  tags: Tag[]
  initialTagIds: string[]
}) {
  const { goBack } = useGoBack('/channels')
  const updateChannelTags = useUpdateChannelTags()
  const [selected, setSelected] = useState(() => new Set(initialTagIds))
  const [creating, setCreating] = useState(false)
  const saving = useRef(false)

  const addTagIds = [...selected].filter((id) => !initialTagIds.includes(id))
  const removeTagIds = initialTagIds.filter((id) => !selected.has(id))
  const dirty = addTagIds.length > 0 || removeTagIds.length > 0

  const blocker = useBlocker({
    shouldBlockFn: () => dirty && !saving.current,
    enableBeforeUnload: () => dirty && !saving.current,
    withResolver: true,
  })

  function toggle(tagId: string, pressed: boolean) {
    setSelected((current) => {
      const next = new Set(current)
      if (pressed) next.add(tagId)
      else next.delete(tagId)
      return next
    })
  }

  function save() {
    saving.current = true
    updateChannelTags.mutate({ channelIds: [channel.channelId], addTagIds, removeTagIds })
    goBack()
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-8 px-4 pt-4">
        <a
          href={youtubeChannelUrl(channel.channelId)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${channel.title} on YouTube`}
          className="flex flex-col items-center gap-3 self-center rounded-xl p-2 text-center outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-24">
            {channel.thumbnailUrl && (
              <AvatarImage src={channel.thumbnailUrl} alt="" referrerPolicy="no-referrer" />
            )}
            <AvatarFallback className="text-3xl">
              {channel.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="max-w-full min-w-0">
            <h2 className="truncate text-lg font-semibold">{channel.title}</h2>
            {channel.handle && (
              <p className="truncate text-sm text-muted-foreground">{channel.handle}</p>
            )}
          </div>
        </a>

        <div className="flex flex-col gap-3">
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You don't have any tags yet. Create one to start organizing your channels.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagToggle
                key={tag.id}
                tag={tag}
                pressed={selected.has(tag.id)}
                onPressedChange={(pressed) => toggle(tag.id, pressed)}
              />
            ))}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-dashed px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus className="size-4" />
              Create new tag
            </button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex justify-end bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button size="lg" className="px-6" disabled={!dirty} onClick={save}>
          Save
        </Button>
      </div>

      <CreateTagDialog
        open={creating}
        onOpenChange={setCreating}
        tags={tags}
        onCreated={(tag) => toggle(tag.id, true)}
      />

      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent onEscapeKeyDown={() => blocker.reset?.()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The tags you changed for {channel.title} won't be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => blocker.proceed?.()}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SelectTagsSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-4 pt-4" aria-busy="true" aria-label="Loading channel">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  )
}
