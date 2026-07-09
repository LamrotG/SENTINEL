import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Boxes,
  Clock,
  FileText,
  Settings,
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
import { InvitationActions } from '@/components/invitation-actions'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { fmtDate } from '@/lib/utils'
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

  const { rows } = await db.query(
    `SELECT c.*, u.full_name AS lead_name, u.username AS lead_username
     FROM investigation_cases c
     JOIN users u ON u.id = c.lead_id
     WHERE c.id = $1`,
    [id]
  )

  const investigation = rows[0]
  if (!investigation) notFound()

  const session = await getSession()
  const userId = session?.id as string | undefined
  let pendingInvitation: { id: string; type: string; role: string | null } | null = null
  if (userId) {
    const { rows: invRows } = await db.query<{ id: string; type: string; role: string | null }>(
      `SELECT id, type, role FROM case_invitations WHERE case_id = $1 AND invitee_id = $2 AND status = 'pending'`,
      [id, userId],
    )
    pendingInvitation = invRows[0] ?? null
  }

  const { rows: members } = await db.query(
    `SELECT cm.*, u.full_name, u.username
     FROM case_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.case_id = $1
     ORDER BY cm.joined_at ASC`,
    [id]
  )

  const localCase = getCase(id)

  const caseEntities: Entity[] = (localCase?.entityIds || [])
    .map((entityId: string) => getEntity(entityId))
    .filter((e: Entity | undefined): e is Entity => Boolean(e))

  const caseEvidence: Evidence[] = (localCase?.evidenceIds || [])
    .map((evidenceId: string) => getEvidence(evidenceId))
    .filter((e: Evidence | undefined): e is Evidence => Boolean(e))

  const caseTimeline: TimelineEvent[] = timelineEvents.filter(
    (e) => e.caseId === id
  )

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
    { href: `/cases/${id}/settings`, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader
        title={investigation.title}
        description={`${investigation.category} · Lead: ${investigation.lead_name} · Created ${fmtDate(investigation.created_at)}`}
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

      {pendingInvitation && (
        <div className="mx-6 mt-5 flex items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4">
          <div>
            <p className="text-sm font-medium">You&apos;ve been invited to join this case</p>
            <p className="text-xs text-muted-foreground">
              {pendingInvitation.type === 'viewer'
                ? 'View-only access'
                : `Collaborator${pendingInvitation.role ? ` · ${pendingInvitation.role}` : ''}`}
            </p>
          </div>
          <InvitationActions invitationId={pendingInvitation.id} />
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-border px-6 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          {investigation.id}
        </span>
        <StatusBadge status={investigation.status} />
        <PriorityBadge priority={investigation.priority} />
        <span className="ml-auto text-xs text-muted-foreground">
          Updated {fmtDate(investigation.updated_at)}
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

          {caseTimeline.length > 0 && (
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
          )}

          {caseEvidence.length > 0 && (
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
                    <th className="hidden px-4 py-2 font-medium md:table-cell">Confidence</th>
                    <th className="px-4 py-2 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {caseEvidence.slice(0, 6).map((e: Evidence) => (
                    <tr key={e.id} className="hover:bg-accent/40">
                      <td className="max-w-50 truncate px-4 py-2.5 font-medium">{e.name}</td>
                      <td className="px-4 py-2.5"><EvidenceTypeBadge type={e.type} /></td>
                      <td className="hidden w-40 px-4 py-2.5 md:table-cell"><ConfidenceBar value={e.confidence} showLabel={false} /></td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">{e.addedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel className="p-4">
            <SectionTitle>Case Team</SectionTitle>
            <ul className="mt-3 space-y-2">
              {members.map((member: Record<string, string>) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-info/20 text-[11px] font-semibold text-info">
                    {member.full_name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.full_name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{member.role}</p>
                  </div>
                  {member.user_id === investigation.lead_id && (
                    <span className="ml-auto text-[11px] text-muted-foreground">Lead</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>

          {Object.keys(grouped).length > 0 && (
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
                            <p className="truncate text-sm font-medium">{e.label}</p>
                            {e.subLabel && (
                              <p className="truncate text-[11px] text-muted-foreground">{e.subLabel}</p>
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
          )}
        </div>
      </div>
    </div>
  )
}
