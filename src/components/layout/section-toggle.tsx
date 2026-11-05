import { Link } from '@tanstack/react-router'
import { MonitorPlay, Rss, type LucideIcon } from 'lucide-react'

interface Section {
  to: '/channels' | '/feed'
  label: string
  icon: LucideIcon
}

const SECTIONS: Section[] = [
  { to: '/channels', label: 'Channels', icon: MonitorPlay },
  { to: '/feed', label: 'Feed', icon: Rss },
]

export function SectionToggle() {
  return (
    <nav aria-label="Sections" className="grid flex-1 grid-cols-2 rounded-full bg-secondary p-1">
      {SECTIONS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex h-8 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground transition-colors data-[status=active]:bg-background data-[status=active]:text-foreground data-[status=active]:shadow-sm"
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
