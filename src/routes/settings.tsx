import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  return (
    <main className="mx-auto max-w-[640px]">
      <header className="flex h-16 items-center gap-2 px-2 pt-[env(safe-area-inset-top)]">
        <Button variant="ghost" size="icon-lg" asChild>
          <Link to="/channels" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>
      <p className="px-4 text-muted-foreground">Settings arrive in a later phase.</p>
    </main>
  )
}
