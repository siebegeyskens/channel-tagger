import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout/page-header'

export const Route = createFileRoute('/_tabs/tags/')({ component: TagsPage })

function TagsPage() {
  return (
    <>
      <PageHeader title="Tags" />
      <p className="px-4 text-muted-foreground">Your tags will show up here.</p>
    </>
  )
}
