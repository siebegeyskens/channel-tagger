import { tagColorClasses } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'

export function TagChip({
  name,
  color,
  className,
}: {
  name: string
  color: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 max-w-full items-center rounded-full px-3 text-sm font-medium',
        tagColorClasses(color).chip,
        className,
      )}
    >
      <span className="truncate">{name}</span>
    </span>
  )
}
