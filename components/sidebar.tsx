'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Boxes,
  Clock,
  FileText,
  FolderClosed,
  LayoutDashboard,
  Network,
  Shield,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cases', label: 'Cases', icon: FolderClosed, match: '/cases' },
  { href: '/workspace', label: 'Workspace', icon: Workflow },
  { href: '/evidence', label: 'Evidence', icon: Boxes },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/entities', label: 'Entities', icon: Network },
  { href: '/reports', label: 'Reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary">
          <Shield className="size-4.5 text-primary-foreground" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Sentinel</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Intelligence Platform
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Investigation
        </p>
        {nav.map((item) => {
          const matchPath = item.match ?? item.href
          const active =
            matchPath === '/'
              ? pathname === '/'
              : pathname.startsWith(matchPath)
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
              {active && (
                <span className="ml-auto h-4 w-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-info/20 text-xs font-semibold text-info">
            SC
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">Sarah Chen</p>
            <p className="truncate text-xs text-muted-foreground">
              Lead Investigator
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
