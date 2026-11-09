import { useEffect, useRef, useState } from 'react'

import { TagChip } from '@/components/tag-chip'
import type { Tag } from '@/lib/tags'
import { cn } from '@/lib/utils'

const GAP = 4
const MORE_WIDTH = 32

function end(chip: HTMLElement) {
  return chip.offsetLeft + chip.offsetWidth
}

interface Fit {
  count: number
  moreLeft: number
}

export function TagChipList({ tags, className }: { tags: Tag[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<Fit>({ count: tags.length, moreLeft: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      const width = container.clientWidth
      const chips = Array.from(container.children).slice(0, tags.length) as HTMLElement[]
      if (chips.every((chip) => end(chip) <= width)) {
        setFit({ count: chips.length, moreLeft: 0 })
        return
      }
      let count = 0
      while (count < chips.length && end(chips[count]) + GAP + MORE_WIDTH <= width) count++
      setFit({ count, moreLeft: count ? end(chips[count - 1]) + GAP : 0 })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [tags])

  const hidden = tags.length - fit.count

  return (
    <div ref={containerRef} className={cn('relative flex gap-1 overflow-hidden', className)}>
      {tags.map((tag, index) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          size="sm"
          className={cn('shrink-0', index >= fit.count && 'invisible')}
        />
      ))}
      {hidden > 0 && (
        <span
          style={{ left: fit.moreLeft }}
          className="absolute top-0 inline-flex h-5 items-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground"
        >
          +{hidden}
        </span>
      )}
    </div>
  )
}
