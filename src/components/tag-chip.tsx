import { tagColorClasses } from '@/lib/tag-colors'
import { cn } from '@/lib/utils'

export function TagChip({
  name,
  color,
  size = 'default',
  className,
}: {
  name: string
  color: string
  size?: 'default' | 'sm'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full font-medium',
        size === 'sm' ? 'h-5 px-2 text-xs' : 'h-7 px-3 text-sm',
        tagColorClasses(color).chip,
        className,
      )}
    >
      <span className="truncate">{name}</span>
    </span>
  )
}
