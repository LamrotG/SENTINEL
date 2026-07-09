'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { EntityGlyph, EvidenceTypeBadge } from '@/components/primitives'
import { SidebarPanelHeader, CollapsedPanelRail } from '@/components/sidebar-panel-header'
import { getEntity } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import { useResizablePanel } from '@/lib/use-resizable-panel'
import { getEventTypeMeta } from '@/lib/event-types'
import type { CaseEvent, Evidence } from '@/lib/types'
import { cn } from '@/lib/utils'

const COLLAPSED_FILTER_W = 40
const DEFAULT_FILTER_W = 224

function mapRow(r: Record<string, unknown>): CaseEvent {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string) ?? '',
    caseId: r.case_id as string,
    entityIds: (r.entity_ids as string[]) ?? [],
    evidenceIds: (r.evidence_ids as string[]) ?? [],
    eventType: (r.event_type as string) ?? 'other',
    occurredAt: r.occurred_at as string,
    location: (r.location as string) ?? '',
    tags: (r.tags as string[]) ?? [],
    notes: (r.notes as string) ?? '',
  }
}

export function TimelineView() {
  const { activeCaseId } = useCase()
  const router = useRouter()
  const [events, setEvents] = useState<CaseEvent[]>([])
  const [caseEvidence, setCaseEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { containerRef, currentWidth, collapsed, setCollapsed, startResize } = useResizablePanel({
    collapsedWidth: COLLAPSED_FILTER_W,
    defaultWidth: DEFAULT_FILTER_W,
  })

  useEffect(() => {
    if (!activeCaseId) return
    setLoading(true)
    setSelectedId(null)
    fetch(`/api/events?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setEvents((Array.isArray(rows) ? rows : []).map(mapRow)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))

    fetch(`/api/evidence?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) =>
        setCaseEvidence(
          (Array.isArray(rows) ? rows : []).map((r) => ({
            id: r.id,
            name: r.name,
            type: r.type,
            source: r.source ?? '',
            addedAt: r.added_at ?? '',
            size: r.size ?? '',
            tags: r.tags ?? [],
            confidence: r.confidence ?? 0,
            caseId: r.case_id,
            linkedEntityIds: r.linked_entity_ids ?? [],
            summary: r.summary ?? '',
          })),
        ),
      )
      .catch(() => setCaseEvidence([]))
  }, [activeCaseId])

  const usedTypes = useMemo(() => Array.from(new Set(events.map((e) => e.eventType))), [events])

  const filtered = useMemo(
    () => (catFilter.length ? events.filter((e) => catFilter.includes(e.eventType)) : events),
    [catFilter, events],
  )

  const selected = selectedId ? filtered.find((e) => e.id === selectedId) ?? null : null
  const selEntities = selected ? selected.entityIds.map(getEntity).filter(Boolean) : []
  const selEvidence = selected
    ? selected.evidenceIds.map((id) => caseEvidence.find((e) => e.id === id)).filter(Boolean)
    : []

  function toggleCat(c: string) {
    setCatFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex h-full">
      {collapsed ? (
        <CollapsedPanelRail label="Filters" onExpand={() => setCollapsed(false)} />
      ) : (
        <div
          ref={containerRef}
          className="relative flex shrink-0 flex-col border-r border-border bg-card"
          style={{ width: currentWidth }}
        >
          <SidebarPanelHeader label="Filters" onCollapse={() => setCollapsed(true)} />

          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Event Type</p>
            <div className="space-y-1">
              {usedTypes.map((c) => {
                const meta = getEventTypeMeta(c)
                const Icon = meta.icon
                return (
                  <label key={c} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <input type="checkbox" checked={catFilter.includes(c)} onChange={() => toggleCat(c)} className="accent-primary" />
                    <Icon className={cn('size-3.5', meta.color)} aria-hidden />
                    {meta.label}
                  </label>
                )
              })}
              {usedTypes.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
            </div>
          </div>

          <div onPointerDown={startResize} className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30" />
        </div>
      )}

      {/* Timeline */}
      <div className="min-w-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <p className="mb-4 text-xs text-muted-foreground">
          {loading ? 'Loading…' : `${filtered.length} events · chronological reconstruction`}
        </p>
        <div className="relative ml-2">
          <span className="absolute bottom-2 left-[1.05rem] top-2 w-px bg-border" />
          <ol>
            {filtered.map((event) => {
              const meta = getEventTypeMeta(event.eventType)
              const Icon = meta.icon
              const active = selected?.id === event.id
              return (
                <li key={event.id} className="relative flex gap-4 pb-4 last:pb-0">
                  <span
                    className={cn(
                      'z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-card',
                      active ? 'border-primary' : 'border-border',
                    )}
                  >
                    <Icon className={cn('size-4', meta.color)} aria-hidden />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelect(event.id)}
                    className={cn(
                      'flex-1 rounded-lg border p-4 text-left transition-colors',
                      active
                        ? 'border-primary bg-accent/50'
                        : 'border-border bg-card hover:border-muted-foreground/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        {new Date(event.occurredAt).toLocaleString()}
                      </p>
                      <span className={cn('text-[10px] font-medium uppercase tracking-wider', meta.color)}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{event.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground text-pretty">
                      {event.description}
                    </p>
                  </button>
                </li>
              )
            })}
          </ol>
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No events yet. Create one from the{' '}
              <button type="button" onClick={() => router.push('/events')} className="font-medium text-primary hover:underline">
                Events page
              </button>
              .
            </p>
          )}
        </div>
      </div>

      {/* Read-only detail — editing happens on the Events page */}
      {selected && (
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Detail
            </p>
            <button
              type="button"
              onClick={() => router.push(`/events?highlight=${selected.id}`)}
              className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Edit in Events <ArrowUpRight className="size-3.5" />
            </button>
          </div>
          <div className="space-y-5 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</p>
              <p className="font-mono text-xs text-muted-foreground">{new Date(selected.occurredAt).toLocaleString()}</p>
              <p className="mt-2 text-sm font-semibold">{selected.title}</p>
              {selected.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {selected.location}
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{selected.description}</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Entities Involved · {selEntities.length}
              </p>
              {selEntities.length ? (
                <ul className="space-y-1.5">
                  {selEntities.map(
                    (ent) =>
                      ent && (
                        <li
                          key={ent.id}
                          className="flex items-center gap-2.5 rounded-md border border-border bg-elevated/60 px-2.5 py-2"
                        >
                          <EntityGlyph type={ent.type} className="size-7" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{ent.label}</p>
                            <p className="truncate text-[10px] text-muted-foreground">{ent.subLabel}</p>
                          </div>
                        </li>
                      ),
                  )}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">None linked.</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Linked Evidence · {selEvidence.length}
              </p>
              {selEvidence.length ? (
                <ul className="space-y-1.5">
                  {selEvidence.map(
                    (ev) =>
                      ev && (
                        <li
                          key={ev.id}
                          className="rounded-md border border-border bg-elevated/60 px-2.5 py-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-medium">{ev.name}</p>
                            <EvidenceTypeBadge type={ev.type} />
                          </div>
                        </li>
                      ),
                  )}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No evidence attached.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
