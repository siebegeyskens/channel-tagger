import { Link } from '@tanstack/react-router'
import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Button variant="ghost" size="icon-lg" asChild>
        <Link to="/settings" aria-label="Settings">
          <Settings className="size-5" />
        </Link>
      </Button>
    </header>
  )
}
