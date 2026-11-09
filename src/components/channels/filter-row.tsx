import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowDownAZ, ArrowUpZA, ListFilter, Settings2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UNTAGGED, toggleTagFilter, type ChannelSearch } from '@/lib/channel-filters'
import { tagColorClasses } from '@/lib/tag-colors'
import type { Tag } from '@/lib/tags'
import { cn } from '@/lib/utils'

const CHIP =
  'flex h-8 shrink-0 items-center gap-1 rounded-full pr-1.5 pl-3 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

export function FilterRow({
  tags,
  selected,
  sort,
}: {
  tags: Tag[]
  selected: string[]
  sort?: 'az' | 'za'
}) {
  const navigate = useNavigate()

  function setSearch(update: ChannelSearch) {
    void navigate({ to: '.', search: (prev) => ({ ...prev, ...update }), replace: true })
  }

  function toggle(tagId: string) {
    setSearch({ tags: toggleTagFilter(selected, tagId) })
  }

  const selectedTags = tags.filter((tag) => selected.includes(tag.id))
  const untagged = selected.includes(UNTAGGED)

  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 bg-background/95 py-2 pl-4 backdrop-blur">
      {sort && (
        <SortMenu
          sort={sort}
          onChange={(next) => setSearch({ sort: next === 'za' ? 'za' : undefined })}
        />
      )}
      <TagFilterMenu tags={tags} selected={selected} onToggle={toggle} />
      {selected.length > 0 && (
        <div className="flex min-w-0 flex-1 [scrollbar-width:none] gap-2 overflow-x-auto pr-4">
          {selectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggle(tag.id)}
              aria-label={`Remove ${tag.name} filter`}
              className={cn(CHIP, tagColorClasses(tag.color).chip)}
            >
              {tag.name}
              <X className="size-3.5" />
            </button>
          ))}
          {untagged && (
            <button
              type="button"
              onClick={() => toggle(UNTAGGED)}
              aria-label="Remove Untagged filter"
              className={cn(CHIP, 'border border-dashed text-muted-foreground')}
            >
              Untagged
              <X className="size-3.5" />
            </button>
          )}
          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => setSearch({ tags: undefined })}
              className="flex h-8 shrink-0 items-center px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SortMenu({ sort, onChange }: { sort: 'az' | 'za'; onChange: (sort: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          aria-label={sort === 'za' ? 'Sort: name Z to A' : 'Sort: name A to Z'}
        >
          {sort === 'za' ? <ArrowUpZA /> : <ArrowDownAZ />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup value={sort} onValueChange={onChange}>
          <DropdownMenuRadioItem value="az">Name A–Z</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="za">Name Z–A</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TagFilterMenu({
  tags,
  selected,
  onToggle,
}: {
  tags: Tag[]
  selected: string[]
  onToggle: (tagId: string) => void
}) {
  const active = selected.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={active ? 'default' : 'outline'}
          size={active ? 'default' : 'icon'}
          className="shrink-0 rounded-full"
          aria-label={active ? `Filter by tag, ${selected.length} selected` : 'Filter by tag'}
        >
          <ListFilter />
          {active && selected.length}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-60">
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag.id}
            checked={selected.includes(tag.id)}
            onCheckedChange={() => onToggle(tag.id)}
            onSelect={(event) => event.preventDefault()}
          >
            <span
              className={cn('size-2.5 shrink-0 rounded-full', tagColorClasses(tag.color).dot)}
            />
            <span className="truncate">{tag.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuCheckboxItem
          checked={selected.includes(UNTAGGED)}
          onCheckedChange={() => onToggle(UNTAGGED)}
          onSelect={(event) => event.preventDefault()}
          className="text-muted-foreground"
        >
          <span className="size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground" />
          Untagged
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/tags">
            <Settings2 />
            Manage tags
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
