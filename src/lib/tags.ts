import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { channelsQueryOptions, type Channel } from '@/lib/channels'
import { compareText } from '@/lib/compare'
import { supabase } from '@/lib/supabase/client'

export interface Tag {
  id: string
  name: string
  color: string
}

export interface ChannelTag {
  channel_id: string
  tag_id: string
}

export interface TagInput {
  name: string
  color: string
}

export interface TagsData {
  tags: Tag[]
  channelTags: ChannelTag[]
}

export interface ChannelTagsChange {
  channelIds: string[]
  addTagIds: string[]
  removeTagIds: string[]
}

const PAGE_SIZE = 1000

function sortTags(tags: Tag[]) {
  return tags.toSorted((a, b) => compareText(a.name, b.name))
}

async function fetchTags() {
  const { data, error } = await supabase.from('tags').select('id, name, color')
  if (error) throw error
  return sortTags(data)
}

async function fetchChannelTags() {
  const rows: ChannelTag[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('channel_tags')
      .select('channel_id, tag_id')
      .order('channel_id')
      .order('tag_id')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < PAGE_SIZE) return rows
  }
}

export const tagsQueryOptions = queryOptions({
  queryKey: ['tags'],
  queryFn: async (): Promise<TagsData> => {
    const [tags, channelTags] = await Promise.all([fetchTags(), fetchChannelTags()])
    return { tags, channelTags }
  },
  staleTime: 5 * 60 * 1000,
})

export function isDuplicateNameError(error: unknown) {
  return error instanceof Error && 'code' in error && error.code === '23505'
}

export function groupChannelsByTag(channels: Channel[], channelTags: ChannelTag[]) {
  const channelsById = new Map(channels.map((channel) => [channel.channelId, channel]))
  const byTag = new Map<string, Channel[]>()
  for (const { channel_id, tag_id } of channelTags) {
    const channel = channelsById.get(channel_id)
    if (!channel) continue
    const list = byTag.get(tag_id)
    if (list) list.push(channel)
    else byTag.set(tag_id, [channel])
  }
  return byTag
}

export function useChannelsByTag() {
  const { data: channels } = useQuery(channelsQueryOptions)
  const { data: tagsData } = useQuery(tagsQueryOptions)
  return useMemo(
    () => (channels && tagsData ? groupChannelsByTag(channels, tagsData.channelTags) : undefined),
    [channels, tagsData],
  )
}

export function groupTagsByChannel({ tags, channelTags }: TagsData) {
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]))
  const byChannel = new Map<string, Tag[]>()
  for (const { channel_id, tag_id } of channelTags) {
    const tag = tagsById.get(tag_id)
    if (!tag) continue
    const list = byChannel.get(channel_id)
    if (list) list.push(tag)
    else byChannel.set(channel_id, [tag])
  }
  for (const list of byChannel.values()) list.sort((a, b) => compareText(a.name, b.name))
  return byChannel
}

export function useTagsByChannel() {
  const { data } = useQuery(tagsQueryOptions)
  return useMemo(() => (data ? groupTagsByChannel(data) : undefined), [data])
}

function applyChannelTagsChange(data: TagsData, change: ChannelTagsChange): TagsData {
  const channelIds = new Set(change.channelIds)
  const removeTagIds = new Set(change.removeTagIds)
  const kept = data.channelTags.filter(
    (row) => !(channelIds.has(row.channel_id) && removeTagIds.has(row.tag_id)),
  )
  const existing = new Set(kept.map((row) => `${row.channel_id}:${row.tag_id}`))
  const added = change.channelIds.flatMap((channel_id) =>
    change.addTagIds
      .filter((tag_id) => !existing.has(`${channel_id}:${tag_id}`))
      .map((tag_id) => ({ channel_id, tag_id })),
  )
  return { ...data, channelTags: [...kept, ...added] }
}

export function useUpdateChannelTags() {
  const queryClient = useQueryClient()
  const queryKey = tagsQueryOptions.queryKey
  return useMutation({
    mutationFn: async ({ channelIds, addTagIds, removeTagIds }: ChannelTagsChange) => {
      const rows = channelIds.flatMap((channel_id) =>
        addTagIds.map((tag_id) => ({ channel_id, tag_id })),
      )
      const [added, removed] = await Promise.all([
        rows.length
          ? supabase.from('channel_tags').upsert(rows, { ignoreDuplicates: true })
          : undefined,
        channelIds.length && removeTagIds.length
          ? supabase
              .from('channel_tags')
              .delete()
              .in('channel_id', channelIds)
              .in('tag_id', removeTagIds)
          : undefined,
      ])
      if (added?.error) throw added.error
      if (removed?.error) throw removed.error
    },
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (data) => data && applyChannelTagsChange(data, change))
      return { previous }
    },
    onError: (_error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error("Couldn't update the tags. Please try again.")
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

function useSetTagsData() {
  const queryClient = useQueryClient()
  return (update: (data: TagsData) => TagsData) =>
    queryClient.setQueryData(tagsQueryOptions.queryKey, (data) => data && update(data))
}

export function useCreateTag() {
  const setTagsData = useSetTagsData()
  return useMutation({
    mutationFn: async (input: TagInput) => {
      const { data, error } = await supabase
        .from('tags')
        .insert(input)
        .select('id, name, color')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (tag) => setTagsData((data) => ({ ...data, tags: sortTags([...data.tags, tag]) })),
  })
}

export function useUpdateTag() {
  const setTagsData = useSetTagsData()
  return useMutation({
    mutationFn: async ({ id, ...input }: TagInput & { id: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .update(input)
        .eq('id', id)
        .select('id, name, color')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (tag) =>
      setTagsData((data) => ({
        ...data,
        tags: sortTags(data.tags.map((existing) => (existing.id === tag.id ? tag : existing))),
      })),
  })
}

export function useDeleteTag() {
  const setTagsData = useSetTagsData()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: (id) =>
      setTagsData((data) => ({
        tags: data.tags.filter((tag) => tag.id !== id),
        channelTags: data.channelTags.filter((row) => row.tag_id !== id),
      })),
  })
}
