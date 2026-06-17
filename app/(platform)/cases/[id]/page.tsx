import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Boxes,
  Clock,
  FileText,
  Workflow,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  getEntityMeta,
  Panel,
  PriorityBadge,
  RiskScore,
  SectionTitle,
  StatusBadge,
} from '@/components/primitives'
import { supabase } from '@/lib/supabase'
import {
  getCase,
  getEntity,
  getEvidence,
  timelineEvents,
} from '@/lib/data'
import type { TimelineEvent, Entity, Evidence } from '@/lib/type'

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch case from Supabase
  const { data: investigation, error } = await supabase
    .from('investigation_cases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !investigation) notFound()

 const localCase = getCase(id)

const caseEntities: Entity[] = (localCase?.entityIds || [])
  .map((entityId: string) => getEntity(entityId))
  .filter((e: Entity | undefined): e is Entity => Boolean(e))

const caseEvidence: Evidence[] = (localCase?.evidenceIds || [])
  .map((evidenceId: string) => getEvidence(evidenceId))
  .filter((e: Evidence | undefined): e is Evidence => Boolean(e))

  const grouped: Record<string, Entity[]> = caseEntities.reduce<Record<string, Entity[]>>(
    (acc: Record<string, Entity[]>, e: Entity) => {
      (acc[e.type] ??= []).push(e)
      return acc
    },
    {} as Record<string, Entity[]>,
  )

  const quickActions = [
    { href: '/workspace', label: 'Open Workspace', icon: Workflow, primary: true },
    { href: '/timeline', label: 'Timeline', icon: Clock },
    { href: '/evidence', label: 'Evidence Vault', icon: Boxes },
    { href: '/reports', label: 'Generate Report', icon: FileText },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader
        title={investigation.title}
        description={`${investigation.category} · Lead: ${investigation.lead} · Created ${investigation.created_at}`}
        actions={
          <div className="flex items-center gap-2">
            {quickActions.map((a) => {
              const Icon = a.icon
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className={
                    a.primary
                      ? 'flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                      : 'flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-elevated'
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {a.label}
                </Link>
              )
            })}
          </div>
        }
      />

      <div className="flex items-center gap-2 border-b border-border px-6 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          {investigation.id}
        </span>
        <StatusBadge status={investigation.status} />
        <PriorityBadge priority={investigation.priority} />
        <span className="ml-auto text-xs text-muted-foreground">
          Updated {investigation.updated_at}
        </span>
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel className="p-5">
            <SectionTitle>Case Summary</SectionTitle>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-foreground/90">
              {investigation.summary}
            </p>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SectionTitle>Timeline Preview</SectionTitle>
              <Link
                href="/timeline"
                className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              >
                Full reconstruction <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="relative px-5 py-4">
              <span className="absolute bottom-6 left-[1.65rem] top-6 w-px bg-border" />
              <ol>
                {caseTimeline.map((event: TimelineEvent) => (
                  <li key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
                    <span className="z-10 mt-0.5 flex size-3 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {event.timestamp}
                      </p>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground text-pretty">
                        {event.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SectionTitle>Evidence Summary</SectionTitle>
              <Link
                href="/evidence"
                className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
              >
                {caseEvidence.length} items <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2 font-medium">File</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="hidden px-4 py-2 font-medium md:table-cell">
                    Confidence
                  </th>
                  <th className="px-4 py-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {caseEvidence.slice(0, 6).map((e: Evidence) => (
                  <tr key={e.id} className="hover:bg-accent/40">
                    <td className="max-w-50 truncate px-4 py-2.5 font-medium">
                      {e.name}
                    </td>
                    <td className="px-4 py-2.5">
                      <EvidenceTypeBadge type={e.type} />
                    </td>
                    <td className="hidden w-40 px-4 py-2.5 md:table-cell">
                      <ConfidenceBar value={e.confidence} showLabel={false} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {e.addedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-4">
            <SectionTitle>Assigned Team</SectionTitle>
            <ul className="mt-3 space-y-2">
              {investigation.team.map((member: string) => (
                <li key={member} className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-info/20 text-[11px] font-semibold text-info">
                    {member
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </span>
                  <span className="text-sm">{member}</span>
                  {member === investigation.lead && (
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      Lead
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <div className="border-b border-border px-4 py-3">
              <SectionTitle>Entity Snapshot</SectionTitle>
            </div>
            <div className="space-y-4 p-4">
              {Object.entries(grouped).map(([type, list]: [string, Entity[]]) => (
                <div key={type}>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {getEntityMeta(type as never).label} · {list.length}
                  </p>
                  <ul className="space-y-1.5">
                    {list.map((e: Entity) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-2.5 rounded-md border border-border bg-elevated/60 px-2.5 py-2"
                      >
                        <EntityGlyph type={e.type} className="size-7" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {e.label}
                          </p>
                          {e.subLabel && (
                            <p className="truncate text-[11px] text-muted-foreground">
                              {e.subLabel}
                            </p>
                          )}
                        </div>
                        <RiskScore score={e.riskScore} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
