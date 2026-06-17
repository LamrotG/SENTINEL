
/* eslint-disable */
/* stylelint-disable */
'use client'

import { useMemo, useState } from 'react'
import { Check, FileText, Printer, Share2 } from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  PriorityBadge,
  StatusBadge,
} from '@/components/primitives'
import { cases, entities, evidence, theories, timelineEvents } from '@/lib/data'
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

export function ReportBuilder() {
  const [caseId, setCaseId] = useState('CAS-2026-0148')
  const [enabled, setEnabled] = useState<Record<SectionKey, boolean>>({
    summary: true,
    entities: true,
    timeline: true,
    evidence: true,
    theories: true,
    findings: true,
  })

  const activeCase = useMemo(
    () => cases.find((c) => c.id === caseId) ?? cases[0],
    [caseId],
  )

  const caseEntities = entities.filter((e) =>
    activeCase.entityIds.includes(e.id),
  )
  const caseEvidence = evidence.filter((e) =>
    activeCase.evidenceIds.includes(e.id),
  )
  const caseTimeline = timelineEvents.filter((t) => t.caseId === activeCase.id)
  const caseTheories = theories.filter((t) => t.caseId === activeCase.id)

  const toggle = (key: SectionKey) =>
    setEnabled((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="flex h-full">
      {/* Config rail */}
      <div className="w-72 shrink-0 overflow-y-auto scrollbar-thin border-r border-border bg-card">
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
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
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
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Include Sections
            </p>
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
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-elevated px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                <Printer className="size-3.5" />
                Print
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-elevated px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                <Share2 className="size-3.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document preview */}
      <div className="min-w-0 flex-1 overflow-y-auto scrollbar-thin bg-background p-6">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card shadow-sm">
          {/* Document header */}
          <div className="border-b border-border px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Sentinel · Investigation Report
                </p>
                <h1 className="mt-1 text-xl font-semibold text-balance">
                  {activeCase.title}
                </h1>
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
              <Meta label="Lead Investigator" value={activeCase.lead} />
              <Meta label="Category" value={activeCase.category} />
              <Meta label="Opened" value={activeCase.createdAt} />
            </div>
          </div>

          <div className="divide-y divide-border">
            {enabled.summary && (
              <DocSection index={1} title="Executive Summary">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeCase.summary}
                </p>
              </DocSection>
            )}

            {enabled.entities && (
              <DocSection index={2} title="Entities of Interest">
                <div className="space-y-2">
                  {caseEntities.slice(0, 8).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-md border border-border bg-elevated/50 px-3 py-2"
                    >
                      <EntityGlyph type={e.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {e.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.subLabel}
                        </p>
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
                      <p className="font-mono text-xs text-muted-foreground">
                        {t.timestamp}
                      </p>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {t.description}
                      </p>
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
                        <th className="hidden px-3 py-2 font-medium sm:table-cell">
                          Hash
                        </th>
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
                    <div
                      key={t.id}
                      className="rounded-md border border-border bg-elevated/50 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{t.title}</p>
                      </div>
                      <ConfidenceBar value={t.confidence} />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-medium text-success">
                            Supporting
                          </p>
                          <ul className="space-y-1">
                            {t.supporting.map((s) => (
                              <li
                                key={s}
                                className="text-xs leading-relaxed text-muted-foreground"
                              >
                                • {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium text-danger">
                            Contradicting
                          </p>
                          <ul className="space-y-1">
                            {t.contradicting.map((s) => (
                              <li
                                key={s}
                                className="text-xs leading-relaxed text-muted-foreground"
                              >
                                • {s}
                              </li>
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
                  <li>
                    Evidence supports a credential-harvesting intrusion vector
                    originating from a spoofed login portal.
                  </li>
                  <li>
                    Recommend immediate revocation of compromised credentials and
                    forced re-authentication across the finance team.
                  </li>
                  <li>
                    Coordinate with the beneficiary bank to attempt recall of the
                    fraudulent wire transfer.
                  </li>
                  <li>
                    Preserve endpoint ETG-4471 for full forensic imaging and chain
                    of custody continuity.
                  </li>
                </ul>
              </DocSection>
            )}
          </div>

          <div className="border-t border-border px-8 py-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Confidential · Sentinel Investigation Platform · Page 1 of 1
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-elevated/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
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
