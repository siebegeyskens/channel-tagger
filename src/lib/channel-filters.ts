export const UNTAGGED = 'untagged'

export interface ChannelSearch {
  sort?: 'za'
  tags?: string
}

export function validateChannelSearch(search: Record<string, unknown>): ChannelSearch {
  const result: ChannelSearch = {}
  if (search.sort === 'za') result.sort = 'za'
  if (typeof search.tags === 'string' && search.tags) result.tags = search.tags
  return result
}

export function parseTagFilter(tags: string | undefined) {
  return tags ? tags.split(',').filter(Boolean) : []
}

export function toggleTagFilter(selected: string[], tagId: string) {
  const next = selected.includes(tagId)
    ? selected.filter((id) => id !== tagId)
    : [...selected, tagId]
  return next.length ? next.join(',') : undefined
}

export function matchesTagFilter(channelTagIds: string[], selected: Set<string>) {
  if (selected.size === 0) return true
  if (channelTagIds.length === 0) return selected.has(UNTAGGED)
  return channelTagIds.some((id) => selected.has(id))
}
