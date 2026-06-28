import type { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { CaseProvider } from '@/lib/case-context'

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <CaseProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </CaseProvider>
  )
}
