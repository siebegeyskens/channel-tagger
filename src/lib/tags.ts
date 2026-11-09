import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

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
  queryFn: async () => {
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

function useSetTagsData() {
  const queryClient = useQueryClient()
  return (update: (data: { tags: Tag[]; channelTags: ChannelTag[] }) => typeof data) =>
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
