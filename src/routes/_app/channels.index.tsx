import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/channels/')({ component: ChannelsPage })

function ChannelsPage() {
  return <p className="px-4 pt-4 text-muted-foreground">Your channels will show up here.</p>
}
