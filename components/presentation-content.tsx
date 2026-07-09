import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  PriorityBadge,
  StatusBadge,
  SectionTitle,
} from '@/components/primitives'
import type { Entity, Evidence, InvestigationCase, Theory, TimelineEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PresentationContentProps {
  activeCase: InvestigationCase
  caseEntities: Entity[]
  caseEvidence: Evidence[]
  caseTimeline: TimelineEvent[]
  caseTheories: Theory[]
}

/**
 * Read-only presentation body, shared between the authenticated
 * /presentation page and the public, token-gated /present/[token] page —
 * keeping them pixel-identical without duplicating the JSX.
 */
export function PresentationContent({ activeCase, caseEntities, caseEvidence, caseTimeline, caseTheories }: PresentationContentProps) {
  return (
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
  )
}
