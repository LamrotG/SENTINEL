'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import {
  EntityGlyph,
  getEntityMeta,
  RiskScore,
} from '@/components/primitives'
import { entities as allEntities, evidence } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import type { Entity, EntityType } from '@/lib/types'
import { cn } from '@/lib/utils'

const typeOptions: (EntityType | 'all')[] = [
  'all',
  'person',
  'organization',
  'domain',
  'ip',
  'device',
  'wallet',
  'email',
]

export function EntityIntelligence() {
  const { activeCaseId } = useCase()
  const initialEntities = allEntities.filter((e) => e.caseIds.includes(activeCaseId))
  const [entitiesData, setEntitiesData] = useState<Entity[]>(initialEntities)
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function updateEntity(id: string, patch: Partial<Entity>) {
    setEntitiesData((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const filtered = useMemo(
    () =>
      [...entitiesData]
        .filter((e) => typeFilter === 'all' || e.type === typeFilter)
        .sort((a, b) => b.riskScore - a.riskScore),
    [typeFilter, entitiesData],
  )

  const selected = selectedId ? filtered.find((e) => e.id === selectedId) ?? null : null

  const relatedEntities = selected
    ? entitiesData
        .filter(
          (e) =>
            e.id !== selected.id &&
            e.caseIds.some((c) => selected.caseIds.includes(c)),
        )
        .slice(0, 6)
    : []

  const linkedEvidence = selected
    ? evidence.filter((ev) => ev.linkedEntityIds.includes(selected.id))
    : []

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex h-full">
      {/* Table */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2.5">
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors',
                typeFilter === t
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-accent',
              )}
            >
              {t === 'all' ? 'All Entities' : getEntityMeta(t).label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Entity</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Risk Score</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Connections</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => handleSelect(e.id)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-accent/40',
                    selected?.id === e.id && 'bg-accent/60',
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <EntityGlyph type={e.type} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.subLabel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getEntityMeta(e.type).label}
                  </td>
                  <td className="px-4 py-3">
                    <RiskScore score={e.riskScore} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {e.connections}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {e.caseIds.map((c) => (
                        <span
                          key={c}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail — only when selected */}
      {selected && (
        <div className="w-96 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entity Detail
            </p>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close detail"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-5 p-4">
            <div className="flex items-start gap-3">
              <EntityGlyph type={selected.type} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {getEntityMeta(selected.type).label}
                </p>
                <input
                  value={selected.label}
                  onChange={(e) => updateEntity(selected.id, { label: e.target.value })}
                  aria-label="Entity name"
                  className="w-full bg-transparent text-sm font-semibold outline-none focus:border-b focus:border-ring"
                />
                <input
                  value={selected.subLabel ?? ''}
                  onChange={(e) => updateEntity(selected.id, { subLabel: e.target.value })}
                  aria-label="Entity description"
                  placeholder="Add description…"
                  className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40 focus:border-b focus:border-ring"
                />
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Risk Score
              </p>
              <RiskScore score={selected.riskScore} />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Relationship Map
              </p>
              <RelationshipMap center={selected} related={relatedEntities} />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Metadata
              </p>
              <dl className="space-y-1.5 rounded-md border border-border bg-elevated/50 p-3">
                {Object.entries(selected.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-xs">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>
                      <input
                        value={v}
                        onChange={(e) => updateEntity(selected.id, { metadata: { ...selected.metadata, [k]: e.target.value } })}
                        aria-label={k}
                        className="w-full bg-transparent text-right font-medium outline-none focus:border-b focus:border-ring"
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Connected Entities · {relatedEntities.length}
              </p>
              <ul className="space-y-1.5">
                {relatedEntities.map((e) => (
                  <li
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-elevated/60 px-2.5 py-2 hover:border-muted-foreground/40"
                  >
                    <EntityGlyph type={e.type} className="size-7" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{e.label}</p>
                    </div>
                    <RiskScore score={e.riskScore} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Evidence Links · {linkedEvidence.length}
              </p>
              {linkedEvidence.length ? (
                <ul className="space-y-1.5">
                  {linkedEvidence.map((ev) => (
                    <li
                      key={ev.id}
                      className="truncate rounded-md border border-border bg-elevated/60 px-2.5 py-2 text-xs font-medium"
                    >
                      {ev.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No evidence linked.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RelationshipMap({
  center,
  related,
}: {
  center: Entity
  related: Entity[]
}) {
  const size = 280
  const cx = size / 2
  const cy = 90
  const radius = 70
  const nodes = related.slice(0, 6)

  return (
    <div className="rounded-md border border-border bg-background p-2">
      <svg
        viewBox={`0 0 ${size} 190`}
        className="h-44 w-full"
        role="img"
        aria-label="Relationship map"
      >
        {nodes.map((n, i) => {
          const angle = (Math.PI * (i + 0.5)) / nodes.length
          const x = cx + Math.cos(Math.PI - angle) * radius * 1.6
          const y = cy + Math.sin(angle) * radius
          return (
            <line
              key={`l-${n.id}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="oklch(0.6 0.02 256 / 45%)"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          )
        })}
        {nodes.map((n, i) => {
          const angle = (Math.PI * (i + 0.5)) / nodes.length
          const x = cx + Math.cos(Math.PI - angle) * radius * 1.6
          const y = cy + Math.sin(angle) * radius
          return (
            <g key={n.id}>
              <circle cx={x} cy={y} r={11} fill="var(--elevated)" stroke="var(--border)" />
              <circle
                cx={x}
                cy={y}
                r={3}
                fill={
                  n.riskScore >= 70
                    ? 'var(--danger)'
                    : n.riskScore >= 40
                      ? 'var(--warning)'
                      : 'var(--success)'
                }
              />
            </g>
          )
        })}
        <circle cx={cx} cy={cy} r={16} fill="var(--primary)" opacity={0.18} />
        <circle cx={cx} cy={cy} r={9} fill="var(--primary)" />
      </svg>
      <p className="text-center text-[10px] text-muted-foreground">
        {center.label} · {related.length} direct connections
      </p>
    </div>
  )
}
