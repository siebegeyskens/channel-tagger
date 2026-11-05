import { createFileRoute } from '@tanstack/react-router'

import { SubPageHeader } from '@/components/layout/sub-page-header'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  return (
    <main className="mx-auto max-w-[640px]">
      <SubPageHeader title="Settings" />
      <p className="px-4 text-muted-foreground">Settings arrive in a later phase.</p>
    </main>
  )
}
