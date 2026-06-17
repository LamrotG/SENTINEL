import Link from 'next/link'
import {
  ArrowUpRight,
  Boxes,
  FileText,
  FolderClosed,
  Link2,
  StickyNote,
  TriangleAlert,
  Clock,
  AlertOctagon,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import {
  Panel,
  PriorityBadge,
  SectionTitle,
  StatusBadge,
} from '@/components/primitives'
import { activity, alerts, cases, stats } from '@/lib/data'
import type { ActivityItem } from '@/lib/types'
import { cn } from '@/lib/utils'

const statCards = [
  { label: 'Total Cases', value: stats.totalCases, icon: FolderClosed, tone: 'text-foreground' },
  { label: 'Active Investigations', value: stats.activeInvestigations, icon: Boxes, tone: 'text-success' },
  { label: 'High Priority', value: stats.highPriority, icon: TriangleAlert, tone: 'text-warning' },
  { label: 'Closed Cases', value: stats.closedCases, icon: FileText, tone: 'text-muted-foreground' },
]

const activityIcon: Record<ActivityItem['type'], typeof Boxes> = {
  evidence: Boxes,
  entity: Link2,
  timeline: Clock,
  report: FileText,
  note: StickyNote,
}

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader
        title="Investigation Overview"
        description="Active investigations, recent analyst activity, and system correlation alerts."
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s) => {
            const Icon = s.icon
            return (
              <Panel key={s.label} className="p-4">
                <div className="flex items-center justify-between">
                  <SectionTitle>{s.label}</SectionTitle>
                  <Icon className={cn('size-4', s.tone)} aria-hidden />
                </div>
                <p className={cn('mt-3 text-3xl font-semibold tabular-nums', s.tone)}>
                  {s.value}
                </p>
              </Panel>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active cases */}
          <Panel className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <SectionTitle>Active Cases</SectionTitle>
              <span className="text-xs text-muted-foreground">
                {cases.length} cases
              </span>
            </div>
            <ul className="divide-y divide-border">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/cases/${c.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.id}
                        </span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <p className="mt-1 truncate text-sm font-medium group-hover:text-primary">
                        {c.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Lead: {c.lead} · Updated {c.updatedAt}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Alerts + Activity */}
          <div className="space-y-6">
            <Panel>
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <AlertOctagon className="size-4 text-danger" aria-hidden />
                <SectionTitle>Alerts</SectionTitle>
              </div>
              <ul className="divide-y divide-border">
                {alerts.map((a) => (
                  <li key={a.id} className="flex gap-3 px-4 py-3">
                    <span
                      className={cn(
                        'mt-1 size-2 shrink-0 rounded-full',
                        a.severity === 'critical'
                          ? 'bg-danger'
                          : a.severity === 'high'
                            ? 'bg-warning'
                            : 'bg-info',
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground text-pretty">
                        {a.detail}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {a.caseId} · {a.at}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <div className="border-b border-border px-4 py-3">
                <SectionTitle>Investigation Activity</SectionTitle>
              </div>
              <ul className="divide-y divide-border">
                {activity.map((item) => {
                  const Icon = activityIcon[item.type]
                  return (
                    <li key={item.id} className="flex gap-3 px-4 py-3">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-elevated">
                        <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-pretty">
                          <span className="font-medium">{item.actor}</span>{' '}
                          <span className="text-muted-foreground">
                            {item.action}
                          </span>{' '}
                          <span className="font-medium">{item.target}</span>
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {item.caseId} · {item.at}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
