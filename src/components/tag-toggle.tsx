import { Check } from 'lucide-react'

import { tagColorClasses } from '@/lib/tag-colors'
import type { Tag } from '@/lib/tags'
import { cn } from '@/lib/utils'

export function TagToggle({
  tag,
  pressed,
  onPressedChange,
}: {
  tag: Tag
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
}) {
  const colors = tagColorClasses(tag.color)

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'inline-flex h-9 max-w-full items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        pressed ? cn('border-transparent', colors.chip) : 'text-muted-foreground hover:bg-accent',
      )}
    >
      {pressed ? (
        <Check className="size-4 shrink-0" strokeWidth={3} />
      ) : (
        <span className={cn('size-2.5 shrink-0 rounded-full', colors.dot)} />
      )}
      <span className="truncate">{tag.name}</span>
    </button>
  )
}
