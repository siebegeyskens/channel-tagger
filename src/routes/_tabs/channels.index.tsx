import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/layout/page-header'

export const Route = createFileRoute('/_tabs/channels/')({
  component: ChannelsPage,
})

function ChannelsPage() {
  return (
    <>
      <PageHeader title="Channels" />
      <p className="px-4 text-muted-foreground">Your channels will show up here.</p>
    </>
  )
}
