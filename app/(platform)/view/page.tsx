'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  Share2,
  X,
} from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  PriorityBadge,
  StatusBadge,
  SectionTitle,
} from '@/components/primitives'
import {
  cases,
  entities,
  evidence,
  theories,
  timelineEvents,
} from '@/lib/data'
import { cn } from '@/lib/utils'
import { useCase } from '@/lib/case-context'

export default function ViewModePage() {
  const { activeCaseId, setActiveCaseId } = useCase()
  const [caseId, setCaseId] = useState(activeCaseId || cases[0].id)
  const [caseOpen, setCaseOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

  function switchCase(id: string) {
    setCaseId(id)
    setActiveCaseId(id)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const activeCase = useMemo(() => cases.find((c) => c.id === caseId) ?? cases[0], [caseId])
  const caseEntities = entities.filter((e) => activeCase.entityIds.includes(e.id))
  const caseEvidence = evidence.filter((e) => activeCase.evidenceIds.includes(e.id))
  const caseTimeline = timelineEvents.filter((t) => t.caseId === activeCase.id)
  const caseTheories = theories.filter((t) => t.caseId === activeCase.id)

  const content = (
    <div className={cn(
      'h-full overflow-y-auto scrollbar-thin bg-background',
      fullscreen && 'fixed inset-0 z-50',
    )}>
      {/* Presentation bar */}
      <div className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-5 backdrop-blur">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Dashboard
        </Link>
        <span className="h-5 w-px bg-border" />

        {/* Case selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCaseOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-sm font-medium hover:bg-elevated"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="max-w-60 truncate">{activeCase.id}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
          </button>
          {caseOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCaseOpen(false)} aria-hidden />
              <div className="absolute left-0 top-full z-20 mt-1 w-80 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
                {cases.map((c) => (
                  <button key={c.id} type="button" onClick={() => { switchCase(c.id); setCaseOpen(false) }}
                    className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{c.title}</span>
                      <span className="block font-mono text-xs text-muted-foreground">{c.id}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-info/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info">
            Presentation Mode
          </span>
          <button type="button" onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-accent"
          >
            <Share2 className="size-3.5" /> Share View
          </button>
          <button type="button" onClick={() => setFullscreen((f) => !f)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-accent"
          >
            {fullscreen ? <><Minimize2 className="size-3.5" /> Exit Fullscreen</> : <><Maximize2 className="size-3.5" /> Fullscreen</>}
          </button>
        </div>
      </div>

      {/* Case overview */}
      <div className="mx-auto max-w-4xl space-y-8 p-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <StatusBadge status={activeCase.status} />
            <PriorityBadge priority={activeCase.priority} />
            <span className="font-mono text-xs text-muted-foreground">{activeCase.id}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-balance">{activeCase.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeCase.category} · Lead: {activeCase.lead} · Created {activeCase.createdAt}
          </p>
        </div>

        {/* Summary */}
        <section>
          <SectionTitle className="mb-3">Executive Summary</SectionTitle>
          <p className="text-sm leading-relaxed text-foreground/85">{activeCase.summary}</p>
        </section>

        {/* Timeline */}
        {caseTimeline.length > 0 && (
          <section>
            <SectionTitle className="mb-4">Timeline of Events</SectionTitle>
            <ol className="relative space-y-4 border-l-2 border-border pl-6">
              {caseTimeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[1.6rem] top-1 size-3 rounded-full border-2 border-primary bg-background" />
                  <p className="font-mono text-xs text-muted-foreground">{t.timestamp}</p>
                  <p className="mt-0.5 text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Entities */}
        {caseEntities.length > 0 && (
          <section>
            <SectionTitle className="mb-4">Entities of Interest · {caseEntities.length}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {caseEntities.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <EntityGlyph type={e.type} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.subLabel}</p>
                  </div>
                  <span className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 text-xs font-medium tabular-nums',
                    e.riskScore >= 70 ? 'bg-danger/15 text-danger' : e.riskScore >= 40 ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success',
                  )}>
                    {e.riskScore}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Evidence */}
        {caseEvidence.length > 0 && (
          <section>
            <SectionTitle className="mb-4">Evidence Register · {caseEvidence.length}</SectionTitle>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Exhibit</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">Confidence</th>
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {caseEvidence.map((ev, i) => (
                    <tr key={ev.id}>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs text-muted-foreground">EX-{String(i + 1).padStart(2, '0')}</span>{' '}
                        {ev.name}
                      </td>
                      <td className="px-4 py-2.5"><EvidenceTypeBadge type={ev.type} /></td>
                      <td className="hidden w-36 px-4 py-2.5 md:table-cell"><ConfidenceBar value={ev.confidence} showLabel={false} /></td>
                      <td className="hidden px-4 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">{ev.addedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Theories */}
        {caseTheories.length > 0 && (
          <section>
            <SectionTitle className="mb-4">Working Theories</SectionTitle>
            <div className="space-y-4">
              {caseTheories.map((t) => (
                <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium">{t.title}</p>
                  <div className="mt-2"><ConfidenceBar value={t.confidence} /></div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-success">Supporting</p>
                      <ul className="space-y-1">
                        {t.supporting.map((s) => <li key={s} className="text-xs text-muted-foreground">• {s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-danger">Contradicting</p>
                      <ul className="space-y-1">
                        {t.contradicting.map((s) => <li key={s} className="text-xs text-muted-foreground">• {s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="border-t border-border pt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          Confidential · Sentinel Investigation Platform · Presentation Mode
        </div>
      </div>
    </div>
  )

  return (
    <>
      {content}
      {shareOpen && <ShareViewModal caseId={caseId} onClose={() => setShareOpen(false)} />}
    </>
  )
}

function ShareViewModal({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([])

  async function searchUsers(q: string) {
    if (q.length < 2) { setSearchResults([]); return }
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setSearchResults(Array.isArray(data) ? data : [])
  }

  async function handleShare() {
    if (!username) { setError('Enter a username'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cases/${caseId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, type: 'viewer', role: null, permissions: ['view_case'] }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to share'); return }
      setSent(true)
    } catch {
      setError('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Share View Access</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="p-5">
          {sent ? (
            <div className="py-4 text-center">
              <Eye className="mx-auto size-8 text-success" />
              <p className="mt-3 text-sm font-medium">View invitation sent</p>
              <p className="mt-1 text-xs text-muted-foreground">@{username} will receive a notification to accept.</p>
              <button type="button" onClick={onClose} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Username</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={username} onChange={(e) => { setUsername(e.target.value); searchUsers(e.target.value) }}
                    placeholder="Search by username or name…"
                    className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring" />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-border bg-popover">
                    {searchResults.map((u) => (
                      <button key={u.id as string} type="button" onClick={() => { setUsername(u.username as string); setSearchResults([]) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent">
                        <span className="font-medium">{u.full_name as string}</span>
                        <span className="text-xs text-muted-foreground">@{u.username as string}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">The user will receive view-only access to this case's presentation mode. They cannot edit any data.</p>
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
                <button type="button" onClick={handleShare} disabled={!username || loading}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {loading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <><Share2 className="size-4" /> Share View</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
