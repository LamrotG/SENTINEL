'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Radio,
  Server,
  X,
} from 'lucide-react'
import { EntityGlyph, EvidenceTypeBadge } from '@/components/primitives'
import { getEntity, getEvidence, timelineEvents as initialTimeline } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import type { TimelineEvent } from '@/lib/type'
import { cn } from '@/lib/utils'

const categoryMeta: Record<
  TimelineEvent['category'],
  { icon: typeof Activity; color: string; label: string }
> = {
  access: { icon: KeyRound, color: 'text-warning', label: 'Access' },
  communication: { icon: Radio, color: 'text-info', label: 'Communication' },
  transaction: { icon: ArrowLeftRight, color: 'text-danger', label: 'Transaction' },
  system: { icon: Server, color: 'text-muted-foreground', label: 'System' },
  detection: { icon: Activity, color: 'text-confidence', label: 'Detection' },
}

const categories = Object.keys(categoryMeta) as TimelineEvent['category'][]

const MIN_FILTER_W = 180
const MAX_FILTER_W = 320
const DEFAULT_FILTER_W = 224

export function TimelineView() {
  const { activeCaseId } = useCase()
  const [events, setEvents] = useState<TimelineEvent[]>(() =>
    initialTimeline.filter((e) => e.caseId === activeCaseId)
  )
  const [catFilter, setCatFilter] = useState<TimelineEvent['category'][]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function updateEvent(id: string, patch: Partial<TimelineEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [filterWidth, setFilterWidth] = useState(DEFAULT_FILTER_W)
  const resizing = useRef(false)

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    resizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const onMove = (ev: PointerEvent) => {
      if (!resizing.current) return
      setFilterWidth(Math.min(MAX_FILTER_W, Math.max(MIN_FILTER_W, ev.clientX)))
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

  const filtered = useMemo(
    () =>
      catFilter.length
        ? events.filter((e) => catFilter.includes(e.category))
        : events,
    [catFilter, events],
  )

  const selected = selectedId ? filtered.find((e) => e.id === selectedId) ?? null : null
  const selEntities = selected
    ? selected.entityIds.map(getEntity).filter(Boolean)
    : []
  const selEvidence = selected
    ? selected.evidenceIds.map(getEvidence).filter(Boolean)
    : []

  function toggleCat(c: TimelineEvent['category']) {
    setCatFilter((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  function handleSelect(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex h-full">
      {/* Filters — collapsible + resizable */}
      {!filtersCollapsed && (
        <div
          className="relative shrink-0 overflow-y-auto scrollbar-thin border-r border-border bg-card p-4"
          style={{ width: filterWidth }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filters
          </p>
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Event Type
            </p>
            <div className="space-y-1">
              {categories.map((c) => {
                const meta = categoryMeta[c]
                const Icon = meta.icon
                return (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={catFilter.includes(c)}
                      onChange={() => toggleCat(c)}
                      className="accent-primary"
                    />
                    <Icon className={cn('size-3.5', meta.color)} aria-hidden />
                    {meta.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Date Range
            </p>
            <div className="space-y-2 text-xs">
              <div className="relative">
                <input
                  type="date"
                  aria-label="Start date"
                  className="h-8 w-full rounded-md border border-border bg-background px-2 pr-8 outline-none focus:border-ring"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  aria-label="End date"
                  className="h-8 w-full rounded-md border border-border bg-background px-2 pr-8 outline-none focus:border-ring"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-md border border-border bg-elevated px-3 py-2 text-xs font-medium hover:bg-accent"
          >
            Auto-generate from evidence
          </button>

          <div
            onPointerDown={startResize}
            className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
          />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setFiltersCollapsed((c) => !c)}
        className="flex shrink-0 items-center justify-center border-r border-border bg-card px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        title={filtersCollapsed ? 'Show filters' : 'Hide filters'}
      >
        {filtersCollapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* Timeline */}
      <div className="min-w-0 flex-1 overflow-y-auto scrollbar-thin p-6">
        <p className="mb-4 text-xs text-muted-foreground">
          {filtered.length} events · chronological reconstruction
        </p>
        <div className="relative ml-2">
          <span className="absolute bottom-2 left-[1.05rem] top-2 w-px bg-border" />
          <ol>
            {filtered.map((event) => {
              const meta = categoryMeta[event.category]
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
                        {event.timestamp}
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
        </div>
      </div>

      {/* Inspector — only when selected */}
      {selected && (
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Detail
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
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</p>
              <input
                value={selected.timestamp}
                onChange={(e) => updateEvent(selected.id, { timestamp: e.target.value })}
                aria-label="Event timestamp"
                className="w-full bg-transparent font-mono text-xs text-muted-foreground outline-none focus:border-b focus:border-ring"
              />
              <p className="mt-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
              <input
                value={selected.title}
                onChange={(e) => updateEvent(selected.id, { title: e.target.value })}
                aria-label="Event title"
                className="w-full bg-transparent text-sm font-semibold outline-none focus:border-b focus:border-ring"
              />
              <p className="mt-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
              <textarea
                value={selected.description}
                onChange={(e) => updateEvent(selected.id, { description: e.target.value })}
                rows={3}
                aria-label="Event description"
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none focus:border-b focus:border-ring"
              />
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
