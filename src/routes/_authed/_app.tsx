import { Outlet, createFileRoute, retainSearchParams } from '@tanstack/react-router'

import { AccountMenu } from '@/components/layout/account-menu'
import { SectionToggle } from '@/components/layout/section-toggle'
import { validateChannelSearch } from '@/lib/channel-filters'

export const Route = createFileRoute('/_authed/_app')({
  validateSearch: validateChannelSearch,
  search: { middlewares: [retainSearchParams(['sort', 'tags'])] },
  component: AppLayout,
})

function AppLayout() {
  return (
    <main className="mx-auto max-w-[640px] pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-1">
        <SectionToggle />
        <AccountMenu />
      </header>
      <Outlet />
    </main>
  )
}
