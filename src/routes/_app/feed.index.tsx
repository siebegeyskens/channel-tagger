import { createFileRoute } from '@tanstack/react-router'
import { Rss } from 'lucide-react'

export const Route = createFileRoute('/_app/feed/')({ component: FeedPage })

function FeedPage() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-24 text-center">
      <Rss className="size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Coming soon</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        Recent videos from your channels will show up here.
      </p>
    </div>
  )
}
