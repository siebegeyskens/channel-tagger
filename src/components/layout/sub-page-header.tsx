import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useGoBack } from '@/lib/use-go-back'

export function SubPageHeader({
  title,
  backTo = '/channels',
}: {
  title: string
  backTo?: '/channels' | '/tags'
}) {
  const { canGoBack, goBack } = useGoBack(backTo)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-background/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur">
      <Button variant="ghost" size="icon-lg" asChild>
        <Link
          to={backTo}
          aria-label="Back"
          onClick={(event) => {
            if (!canGoBack) return
            event.preventDefault()
            goBack()
          }}
        >
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  )
}
