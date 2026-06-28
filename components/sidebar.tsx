'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FolderClosed,
  LayoutDashboard,
  LogOut,
  Monitor,
  Network,
  Settings,
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
  { href: '/view', label: 'View Mode', icon: Monitor },
]

const MIN_WIDTH = 200
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 240
const COLLAPSED_WIDTH = 56

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [accountOpen, setAccountOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<{ fullName: string; position: string; username: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) setSessionUser({ fullName: data.fullName, position: data.position, username: data.username })
    }).catch(() => {})
  }, [])

  const isResizing = useRef(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev: PointerEvent) => {
      if (!isResizing.current) return
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ev.clientX))
      setWidth(next)
    }

    const onUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentWidth = collapsed ? COLLAPSED_WIDTH : width

  return (
    <aside
      ref={sidebarRef}
      className="group/sidebar relative flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out"
      style={{ width: currentWidth }}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
          <Shield className="size-4.5 text-primary-foreground" aria-hidden />
        </span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight">Sentinel</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              Intelligence Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
        {!collapsed && (
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Investigation
          </p>
        )}
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
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className="ml-auto h-4 w-1 shrink-0 rounded-full bg-primary" />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Account section */}
      <div className="border-t border-sidebar-border p-2" ref={accountRef}>
        <button
          type="button"
          onClick={() => setAccountOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/60',
            collapsed && 'justify-center px-0',
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-info/20 text-xs font-semibold text-info">
            {sessionUser ? sessionUser.fullName.split(' ').map((n) => n[0]).join('') : '??'}
          </span>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">{sessionUser?.fullName ?? 'Loading…'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {sessionUser?.position ?? ''}
              </p>
            </div>
          )}
        </button>

        {accountOpen && (
          <div className="absolute bottom-16 left-2 right-2 z-50 rounded-md border border-border bg-popover p-1 shadow-lg">
            <Link
              href="/settings"
              onClick={() => setAccountOpen(false)}
              className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
            >
              <Settings className="size-4 text-muted-foreground" aria-hidden />
              Settings
            </Link>
            <button
              type="button"
              onClick={async () => {
                setAccountOpen(false)
                await fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }}
              className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-danger transition-colors hover:bg-accent"
            >
              <LogOut className="size-4" aria-hidden />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-17 z-20 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Drag resize handle */}
      {!collapsed && (
        <div
          onPointerDown={startResize}
          className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
        />
      )}
    </aside>
  )
}
