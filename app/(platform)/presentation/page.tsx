'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Link2,
  Loader2,
  Maximize2,
  Minimize2,
  Search,
  Share2,
  X,
} from 'lucide-react'
import { PresentationContent } from '@/components/presentation-content'
import { cases, entities, evidence, theories, timelineEvents } from '@/lib/data'
import { useCase } from '@/lib/case-context'

export default function PresentationPage() {
  const { cases: liveCases, activeCaseId, setActiveCaseId } = useCase()
  const [caseOpen, setCaseOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? cases[0]
  const caseEntities = entities.filter((e) => activeCase.entityIds.includes(e.id))
  const caseEvidence = evidence.filter((e) => activeCase.evidenceIds.includes(e.id))
  const caseTimeline = timelineEvents.filter((t) => t.caseId === activeCase.id)
  const caseTheories = theories.filter((t) => t.caseId === activeCase.id)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-background data-[fullscreen=true]:fixed data-[fullscreen=true]:inset-0 data-[fullscreen=true]:z-50" data-fullscreen={fullscreen}>
      {/* Presentation bar */}
      <div className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-5 backdrop-blur">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Dashboard
        </Link>
        <span className="h-5 w-px bg-border" />

        {/* Case selector — drives the shared global case context */}
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
                {liveCases.map((c) => (
                  <button key={c.id} type="button" onClick={() => { setActiveCaseId(c.id); setCaseOpen(false) }}
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
            <Share2 className="size-3.5" /> Share
          </button>
          <button type="button" onClick={() => setFullscreen((f) => !f)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-accent"
          >
            {fullscreen ? <><Minimize2 className="size-3.5" /> Exit Fullscreen</> : <><Maximize2 className="size-3.5" /> Fullscreen</>}
          </button>
        </div>
      </div>

      <PresentationContent
        activeCase={activeCase}
        caseEntities={caseEntities}
        caseEvidence={caseEvidence}
        caseTimeline={caseTimeline}
        caseTheories={caseTheories}
      />

      {shareOpen && <ShareModal caseId={activeCase.id} onClose={() => setShareOpen(false)} />}
    </div>
  )
}

function ShareModal({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'invite' | 'link'>('invite')

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Share Presentation</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          <button type="button" onClick={() => setTab('invite')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === 'invite' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
            Search User
          </button>
          <button type="button" onClick={() => setTab('link')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === 'link' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
            Copy Link
          </button>
        </div>

        {tab === 'invite' ? <ShareViewModalBody caseId={caseId} /> : <CopyLinkBody caseId={caseId} />}
      </div>
    </div>
  )
}

function ShareViewModalBody({ caseId }: { caseId: string }) {
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
    <div className="p-5">
      {sent ? (
        <div className="py-4 text-center">
          <Eye className="mx-auto size-8 text-success" />
          <p className="mt-3 text-sm font-medium">View invitation sent</p>
          <p className="mt-1 text-xs text-muted-foreground">@{username} will receive a notification to accept.</p>
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
          <p className="text-xs text-muted-foreground">The user will receive view-only access to this case&apos;s presentation mode. They cannot edit any data.</p>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={handleShare} disabled={!username || loading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : <><Share2 className="size-4" /> Share View</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CopyLinkBody({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')

  async function handleCopyLink() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cases/${caseId}/presentation-link`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to generate link'); return }
      const url = `${window.location.origin}/present/${data.token}`
      setLink(url)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-5">
      {error && <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
      <p className="text-xs text-muted-foreground">
        Anyone with this link can view a read-only presentation of this case. They will not have access to Workspace, Evidence, Timeline, Reports, or case management.
      </p>
      {link && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-elevated/50 px-3 py-2">
          <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-xs">{link}</span>
        </div>
      )}
      <div className="flex justify-end border-t border-border pt-4">
        <button type="button" onClick={handleCopyLink} disabled={loading}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {loading ? <Loader2 className="size-4 animate-spin" /> : copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
