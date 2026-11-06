import { createFileRoute } from '@tanstack/react-router'

import { SubPageHeader } from '@/components/layout/sub-page-header'

export const Route = createFileRoute('/_authed/tags/')({ component: ManageTagsPage })

function ManageTagsPage() {
  return (
    <main className="mx-auto max-w-[640px]">
      <SubPageHeader title="Manage tags" />
      <p className="px-4 text-muted-foreground">Your tags will show up here.</p>
    </main>
  )
}
