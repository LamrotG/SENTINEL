/* eslint-disable */
/* stylelint-disable */
import React from 'react'

import {
  Building2,
  Globe,
  HardDrive,
  Laptop,
  Mail,
  Network,
  User,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CaseStatus, EntityType, EvidenceType, Priority } from '@/lib/types'

export function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<CaseStatus, string> = {
    Active: 'bg-success/15 text-success border-success/30',
    Suspended: 'bg-warning/15 text-warning border-warning/30',
    Closed: 'bg-muted text-muted-foreground border-border',
    Archived: 'bg-muted text-muted-foreground/60 border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        map[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    Critical: 'bg-danger/15 text-danger border-danger/30',
    High: 'bg-warning/15 text-warning border-warning/30',
    Medium: 'bg-info/15 text-info border-info/30',
    Low: 'bg-muted text-muted-foreground border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        map[priority],
      )}
    >
      {priority}
    </span>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  )
}

const entityMeta: Record<
  EntityType,
  { icon: typeof User; label: string; color: string }
> = {
  person: { icon: User, label: 'Person', color: 'text-info' },
  organization: { icon: Building2, label: 'Organization', color: 'text-primary' },
  domain: { icon: Globe, label: 'Domain', color: 'text-confidence' },
  ip: { icon: Network, label: 'IP Address', color: 'text-warning' },
  device: { icon: Laptop, label: 'Device', color: 'text-success' },
  wallet: { icon: Wallet, label: 'Wallet', color: 'text-amber-400' },
  email: { icon: Mail, label: 'Email', color: 'text-indigo' },
}

export function getEntityMeta(type: EntityType) {
  return entityMeta[type]
}

export function EntityGlyph({
  type,
  className,
}: {
  type: EntityType
  className?: string
}) {
  const meta = entityMeta[type]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated',
        className,
      )}
    >
      <Icon className={cn('size-4', meta.color)} aria-hidden />
    </span>
  )
}

export function RiskScore({ score }: { score: number }) {
  const level =
    score >= 70
      ? { label: 'High', color: 'text-danger', bar: 'bg-danger' }
      : score >= 40
        ? { label: 'Medium', color: 'text-warning', bar: 'bg-warning' }
        : { label: 'Low', color: 'text-success', bar: 'bg-success' }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', level.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn('w-8 text-xs font-medium tabular-nums', level.color)}>
        {score}
      </span>
    </div>
  )
}

export function ConfidenceBar({
  value,
  showLabel = true,
}: {
  value: number
  showLabel?: boolean
}) {
  const level =
    value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-confidence"
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-confidence">
          {value}% {level}
        </span>
      )}
    </div>
  )
}

const evidenceTone: Record<EvidenceType, string> = {
  Email: 'text-info',
  PDF: 'text-danger',
  CSV: 'text-success',
  Image: 'text-confidence',
  Log: 'text-warning',
  Archive: 'text-muted-foreground',
}

export function EvidenceTypeBadge({ type }: { type: EvidenceType }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-elevated px-2 py-0.5 text-xs font-medium">
      <span className={cn('size-1.5 rounded-full bg-current', evidenceTone[type])} />
      {type}
    </span>
  )
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}
