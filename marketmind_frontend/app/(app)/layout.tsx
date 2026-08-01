import type { ReactNode } from 'react'
import { TopNav } from '@/components/marketmind/top-nav'
import { ProfAlgoPopup } from '@/components/marketmind/prof-algo-popup'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <ProfAlgoPopup />
    </div>
  )
}

