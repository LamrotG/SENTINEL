'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  Printer,
  Share2,
  X,
} from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  PriorityBadge,
  StatusBadge,
} from '@/components/primitives'
import { cases, entities, evidence, theories, timelineEvents } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import { cn } from '@/lib/utils'

type SectionKey =
  | 'summary'
  | 'entities'
  | 'timeline'
  | 'evidence'
  | 'theories'
  | 'findings'

const sectionDefs: { key: SectionKey; label: string }[] = [
  { key: 'summary', label: 'Executive Summary' },
  { key: 'entities', label: 'Entities of Interest' },
  { key: 'timeline', label: 'Timeline of Events' },
  { key: 'evidence', label: 'Evidence Register' },
  { key: 'theories', label: 'Working Theories' },
  { key: 'findings', label: 'Findings & Recommendations' },
]

const MIN_CONFIG_W = 220
const MAX_CONFIG_W = 400
const DEFAULT_CONFIG_W = 288

export function ReportBuilder() {
  const { activeCaseId, setActiveCaseId } = useCase()
  const [enabled, setEnabled] = useState<Record<SectionKey, boolean>>({
    summary: true,
    entities: true,
    timeline: true,
    evidence: true,
    theories: true,
    findings: true,
  })
  const [configCollapsed, setConfigCollapsed] = useState(false)
  const [configWidth, setConfigWidth] = useState(DEFAULT_CONFIG_W)
  const [shareOpen, setShareOpen] = useState(false)
  const resizing = useRef(false)

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    resizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const onMove = (ev: PointerEvent) => {
      if (!resizing.current) return
      setConfigWidth(Math.min(MAX_CONFIG_W, Math.max(MIN_CONFIG_W, ev.clientX)))
    }
    const onUp = () => {
      resizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [])

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeCaseId) ?? cases[0],
    [activeCaseId],
  )

  const caseEntities = entities.filter((e) => activeCase.entityIds.includes(e.id))
  const caseEvidence = evidence.filter((e) => activeCase.evidenceIds.includes(e.id))
  const caseTimeline = timelineEvents.filter((t) => t.caseId === activeCase.id)
  const caseTheories = theories.filter((t) => t.caseId === activeCase.id)

  const toggle = (key: SectionKey) =>
    setEnabled((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="flex h-full">
      {/* Config rail — collapsible + resizable */}
      {!configCollapsed && (
        <div
          className="relative shrink-0 overflow-y-auto scrollbar-thin border-r border-border bg-card"
          style={{ width: configWidth }}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Report Configuration
            </p>
          </div>
          <div className="space-y-5 p-4">
            <div>
              <label htmlFor="case-select" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Case
              </label>
              <select
                id="case-select"
                value={activeCaseId}
                onChange={(e) => setActiveCaseId(e.target.value)}
                className="w-full rounded-md border border-border bg-elevated px-2.5 py-2 text-sm outline-none focus:border-primary"
                aria-label="Select case"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title.split('—')[0].trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Include Sections</p>
              <ul className="space-y-1">
                {sectionDefs.map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => toggle(s.key)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded border',
                          enabled[s.key]
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-elevated',
                        )}
                      >
                        {enabled[s.key] && <Check className="size-3" />}
                      </span>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <FileText className="size-4" />
                Generate Report
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-elevated px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <Printer className="size-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-elevated px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <Share2 className="size-3.5" />
                  Share
                </button>
              </div>
            </div>
          </div>

          <div
            onPointerDown={startResize}
            className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
          />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setConfigCollapsed((c) => !c)}
        className="flex shrink-0 items-center justify-center border-r border-border bg-card px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        title={configCollapsed ? 'Show config' : 'Hide config'}
      >
        {configCollapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Document preview */}
      <div className="relative min-w-0 flex-1 overflow-y-auto scrollbar-thin bg-background p-6">
        <ReportDocument
          activeCase={activeCase}
          enabled={enabled}
          caseEntities={caseEntities}
          caseEvidence={caseEvidence}
          caseTimeline={caseTimeline}
          caseTheories={caseTheories}
        />
      </div>

      {shareOpen && (
        <ShareReportModal
          caseTitle={activeCase.title}
          caseId={activeCase.id}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}

function ShareReportModal({ caseTitle, caseId, onClose }: { caseTitle: string; caseId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!email) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Share Report</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {sent ? (
            <div className="py-4 text-center">
              <Mail className="mx-auto size-8 text-success" />
              <p className="mt-3 text-sm font-medium">Report shared successfully</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF report for "{caseTitle}" sent to {email}</p>
              <button type="button" onClick={onClose} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-elevated/50 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Report</p>
                <p className="mt-0.5 text-sm font-medium">{caseTitle}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{caseId} · PDF attachment</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Share via</p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    <Mail className="size-3.5" /> Email
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Recipient Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@sentinel-intel.org"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
                <button type="button" onClick={handleSend} disabled={!email || sending}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {sending ? <><Loader2 className="size-4 animate-spin" /> Generating PDF…</> : <><Share2 className="size-4" /> Share as PDF</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportDocument({
  activeCase,
  enabled,
  caseEntities,
  caseEvidence,
  caseTimeline,
  caseTheories,
}: {
  activeCase: (typeof cases)[number]
  enabled: Record<SectionKey, boolean>
  caseEntities: typeof entities
  caseEvidence: typeof evidence
  caseTimeline: typeof timelineEvents
  caseTheories: typeof theories
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Sentinel · Investigation Report
            </p>
            <h1 className="mt-1 text-xl font-semibold text-balance">{activeCase.title}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {activeCase.id} · Generated Mar 12, 2026
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={activeCase.status} />
            <PriorityBadge priority={activeCase.priority} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <MetaBlock label="Lead Investigator" value={activeCase.lead} />
          <MetaBlock label="Category" value={activeCase.category} />
          <MetaBlock label="Opened" value={activeCase.createdAt} />
        </div>
      </div>

      <div className="divide-y divide-border">
        {enabled.summary && (
          <DocSection index={1} title="Executive Summary">
            <p className="text-sm leading-relaxed text-muted-foreground">{activeCase.summary}</p>
          </DocSection>
        )}

        {enabled.entities && (
          <DocSection index={2} title="Entities of Interest">
            <div className="space-y-2">
              {caseEntities.slice(0, 8).map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-md border border-border bg-elevated/50 px-3 py-2">
                  <EntityGlyph type={e.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.subLabel}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-xs font-medium tabular-nums',
                      e.riskScore >= 70
                        ? 'bg-danger/15 text-danger'
                        : e.riskScore >= 40
                          ? 'bg-warning/15 text-warning'
                          : 'bg-success/15 text-success',
                    )}
                  >
                    Risk {e.riskScore}
                  </span>
                </div>
              ))}
            </div>
          </DocSection>
        )}

        {enabled.timeline && (
          <DocSection index={3} title="Timeline of Events">
            <ol className="relative space-y-3 border-l border-border pl-5">
              {caseTimeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-5.75 top-1 size-2.5 rounded-full border-2 border-card bg-primary" />
                  <p className="font-mono text-xs text-muted-foreground">{t.timestamp}</p>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                </li>
              ))}
            </ol>
          </DocSection>
        )}

        {enabled.evidence && (
          <DocSection index={4} title="Evidence Register">
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-elevated text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Exhibit</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {caseEvidence.map((ev, i) => (
                    <tr key={ev.id}>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          EX-{String(i + 1).padStart(2, '0')}
                        </span>{' '}
                        {ev.name}
                      </td>
                      <td className="px-3 py-2">
                        <EvidenceTypeBadge type={ev.type} />
                      </td>
                      <td className="hidden px-3 py-2 font-mono text-[10px] text-muted-foreground sm:table-cell">
                        {ev.id ? `${ev.id.slice(0, 18)}…` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DocSection>
        )}

        {enabled.theories && (
          <DocSection index={5} title="Working Theories">
            <div className="space-y-3">
              {caseTheories.map((t) => (
                <div key={t.id} className="rounded-md border border-border bg-elevated/50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{t.title}</p>
                  </div>
                  <ConfidenceBar value={t.confidence} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium text-success">Supporting</p>
                      <ul className="space-y-1">
                        {t.supporting.map((s) => (
                          <li key={s} className="text-xs leading-relaxed text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-danger">Contradicting</p>
                      <ul className="space-y-1">
                        {t.contradicting.map((s) => (
                          <li key={s} className="text-xs leading-relaxed text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DocSection>
        )}

        {enabled.findings && (
          <DocSection index={6} title="Findings & Recommendations">
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>Evidence supports a credential-harvesting intrusion vector originating from a spoofed login portal.</li>
              <li>Recommend immediate revocation of compromised credentials and forced re-authentication across the finance team.</li>
              <li>Coordinate with the beneficiary bank to attempt recall of the fraudulent wire transfer.</li>
              <li>Preserve endpoint ETG-4471 for full forensic imaging and chain of custody continuity.</li>
            </ul>
          </DocSection>
        )}
      </div>

      <div className="border-t border-border px-8 py-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        Confidential · Sentinel Investigation Platform · Page 1 of 1
      </div>
    </div>
  )
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-elevated/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-medium">{value}</p>
    </div>
  )
}

function DocSection({
  index,
  title,
  children,
}: {
  index: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="px-8 py-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 items-center justify-center rounded bg-primary/15 text-xs text-primary">
          {index}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
