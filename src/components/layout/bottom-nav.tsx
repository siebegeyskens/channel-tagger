import { Link } from '@tanstack/react-router'
import { MonitorPlay, Tags, type LucideIcon } from 'lucide-react'

interface NavItem {
  to: '/tags' | '/channels'
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/tags', label: 'Tags', icon: Tags },
  { to: '/channels', label: 'Channels', icon: MonitorPlay },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-[640px]">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground data-[status=active]:text-foreground"
            >
              <span className="flex h-8 w-14 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-secondary">
                <Icon className="size-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
