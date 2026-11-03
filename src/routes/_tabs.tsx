import { Outlet, createFileRoute } from '@tanstack/react-router'

import { BottomNav } from '@/components/layout/bottom-nav'

export const Route = createFileRoute('/_tabs')({ component: TabsLayout })

function TabsLayout() {
  return (
    <>
      <main className="mx-auto max-w-[640px] pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </>
  )
}
