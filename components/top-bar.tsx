'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCase } from '@/lib/case-context'

const CASE_CONTEXT_PAGES = ['/workspace', '/evidence', '/timeline', '/events', '/entities', '/reports', '/presentation']

interface NotifItem {
  id: string; title: string; body?: string; case_id?: string; type: string;
  read: boolean; created_at: string; link?: string; actor_name?: string;
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { cases, activeCaseId, setActiveCaseId, activeCase } = useCase()
  const [caseOpen, setCaseOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [newCaseOpen, setNewCaseOpen] = useState(false)
  const [previewNotif, setPreviewNotif] = useState<NotifItem | null>(null)
  const [notifications, setNotifications] = useState<NotifItem[]>([])
  const [notifsLoaded, setNotifsLoaded] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all')

  const caseRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const showCaseSwitcher = CASE_CONTEXT_PAGES.some((p) => pathname.startsWith(p))
  const unreadCount = notifications.filter((n) => !n.read).length

  const loadNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setNotifications(data)
      }
    } catch { /* ignore on unauthenticated pages */ }
    setNotifsLoaded(true)
  }, [])

  useEffect(() => { loadNotifs() }, [loadNotifs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (caseRef.current && !caseRef.current.contains(e.target as Node)) setCaseOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredNotifs = notifFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications

  return (
    <>
      <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
        {showCaseSwitcher ? (
          <div className="relative" ref={caseRef}>
            <button
              type="button"
              onClick={() => setCaseOpen((o) => !o)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-elevated"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="max-w-52 truncate">{activeCase?.id ?? 'Select case'}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
            </button>
            {caseOpen && (
              <div className="absolute left-0 top-full z-100 mt-1.5 w-80 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Switch case</p>
                {cases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setActiveCaseId(c.id); setCaseOpen(false) }}
                    className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left hover:bg-accent"
                  >
                    <Check className={cn('mt-0.5 size-3.5 shrink-0', c.id === activeCaseId ? 'text-primary' : 'text-transparent')} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{c.title}</span>
                      <span className="block font-mono text-xs text-muted-foreground">{c.id}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="Search cases, entities, evidence…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-elevated hover:text-foreground"
            aria-label="Global filters"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-elevated hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-100 mt-1.5 w-96 rounded-lg border border-border bg-popover shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setNotifFilter('all')} className={cn('rounded px-2 py-0.5 text-xs font-medium', notifFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>All</button>
                    <button type="button" onClick={() => setNotifFilter('unread')} className={cn('rounded px-2 py-0.5 text-xs font-medium', notifFilter === 'unread' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>Unread</button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {filteredNotifs.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="mx-auto size-6 text-muted-foreground/40" />
                      <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    filteredNotifs.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={async () => {
                          setPreviewNotif(n)
                          setNotifOpen(false)
                          if (!n.read) {
                            await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id, action: 'read' }) })
                            loadNotifs()
                          }
                        }}
                        className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50', !n.read && 'bg-primary/5')}
                      >
                        <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-muted-foreground/30' : 'bg-primary')} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.case_id ?? ''} · {new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNewCaseOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" aria-hidden />
            New Case
          </button>
        </div>
      </header>

      {/* Global Filter Modal */}
      {filterOpen && <GlobalFilterModal onClose={() => setFilterOpen(false)} />}

      {/* Notification Preview Modal */}
      {previewNotif && (
        <ModalOverlay onClose={() => setPreviewNotif(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{previewNotif.title}</h3>
              <button type="button" onClick={() => setPreviewNotif(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{previewNotif.body}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              {previewNotif.case_id && <span className="rounded bg-muted px-2 py-0.5 font-mono">{previewNotif.case_id}</span>}
              <span>{new Date(previewNotif.created_at).toLocaleDateString()}</span>
              {previewNotif.actor_name && <span>by {previewNotif.actor_name}</span>}
            </div>
            <div className="mt-5 flex gap-2">
              {previewNotif.case_id && (
                <button
                  type="button"
                  onClick={() => { setPreviewNotif(null); router.push(previewNotif.link || `/cases/${previewNotif.case_id}`) }}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  View Case
                </button>
              )}
              <button type="button" onClick={() => setPreviewNotif(null)} className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
                Dismiss
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* New Case Modal */}
      {newCaseOpen && <NewCaseModal onClose={() => setNewCaseOpen(false)} />}
    </>
  )
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {children}
    </div>
  )
}

function GlobalFilterModal({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [priorityFilters, setPriorityFilters] = useState<string[]>([])
  const [entityType, setEntityType] = useState<string>('all')

  const statuses = ['Active', 'Suspended', 'Closed']
  const priorities = ['Critical', 'High', 'Medium', 'Low']
  const entityTypes = ['all', 'person', 'organization', 'domain', 'ip', 'device', 'wallet', 'email']

  function toggleFilter(arr: string[], val: string, setter: (v: string[]) => void) {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Global Filters</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all pages…"
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Case Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button key={s} type="button" onClick={() => toggleFilter(statusFilters, s, setStatusFilters)} className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition-colors', statusFilters.includes(s) ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-elevated text-muted-foreground hover:bg-accent')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Priority</p>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button key={p} type="button" onClick={() => toggleFilter(priorityFilters, p, setPriorityFilters)} className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition-colors', priorityFilters.includes(p) ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-elevated text-muted-foreground hover:bg-accent')}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Entity Type</p>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              aria-label="Entity type filter"
              className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {entityTypes.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button type="button" onClick={() => { setSearchQuery(''); setStatusFilters([]); setPriorityFilters([]); setEntityType('all') }} className="text-xs font-medium text-primary hover:underline">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Apply Filters
          </button>
        </div>
      </div>
    </ModalOverlay>
  )
}

function NewCaseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'Business Email Compromise',
    priority: 'Medium' as string,
    lead: '',
    summary: '',
  })

  const categories = ['Business Email Compromise', 'Financial Fraud', 'Account Compromise', 'Internal Breach', 'Ransomware', 'Data Exfiltration']
  const priorities = ['Critical', 'High', 'Medium', 'Low']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.lead) {
      setError('Title and lead investigator are required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const id = `CAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: form.title,
          category: form.category,
          status: 'Active',
          priority: form.priority,
          lead: form.lead,
          team: [form.lead],
          summary: form.summary,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create case')
      }

      onClose()
      router.push(`/cases/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case')
    } finally {
      setLoading(false)
    }
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Create New Case</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Case Title *</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Business Email Compromise — Acme Corp"
              required
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} aria-label="Case category" className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm outline-none focus:border-primary">
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Priority</label>
              <select value={form.priority} onChange={(e) => update('priority', e.target.value)} aria-label="Case priority" className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm outline-none focus:border-primary">
                {priorities.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lead Investigator *</label>
            <input
              value={form.lead}
              onChange={(e) => update('lead', e.target.value)}
              placeholder="e.g. Sarah Chen"
              required
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="Brief description of the investigation…"
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
