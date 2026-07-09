'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarSearch, MapPin, Plus, Search, Trash2, X } from 'lucide-react'
import { EntityGlyph, EvidenceTypeBadge, Tag } from '@/components/primitives'
import { SidebarPanelHeader, CollapsedPanelRail } from '@/components/sidebar-panel-header'
import { entities } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import { useResizablePanel } from '@/lib/use-resizable-panel'
import { useDebouncedPatch } from '@/lib/use-debounced-patch'
import { EVENT_TYPE_OPTIONS, getEventTypeMeta } from '@/lib/event-types'
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

export function EventsVault() {
  const { activeCaseId } = useCase()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [events, setEvents] = useState<CaseEvent[]>([])
  const [caseEvidence, setCaseEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const { containerRef, currentWidth, collapsed, setCollapsed, startResize } = useResizablePanel({
    collapsedWidth: COLLAPSED_FILTER_W,
    defaultWidth: DEFAULT_FILTER_W,
  })

  const patchEvent = useDebouncedPatch<CaseEvent>((id) => `/api/events/${id}`)

  const loadEvents = useCallback(() => {
    if (!activeCaseId) return
    setLoading(true)
    fetch(`/api/events?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        const mapped = (Array.isArray(rows) ? rows : []).map(mapRow)
        setEvents(mapped)
        if (highlightId && mapped.some((e) => e.id === highlightId)) setSelectedId(highlightId)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [activeCaseId, highlightId])

  useEffect(() => {
    setSelectedId(null)
    loadEvents()
    if (activeCaseId) {
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
    }
  }, [activeCaseId, loadEvents])

  const caseEntities = useMemo(
    () => entities.filter((e) => e.caseIds.includes(activeCaseId)),
    [activeCaseId],
  )

  function updateEvent(id: string, patch: Partial<CaseEvent>) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    patchEvent(id, patch)
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter.length && !typeFilter.includes(e.eventType)) return false
      if (
        query &&
        !`${e.title} ${e.description} ${e.location} ${e.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false
      return true
    })
  }, [events, typeFilter, query])

  const usedTypes = useMemo(() => Array.from(new Set(events.map((e) => e.eventType))), [events])
  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null

  function toggleType(t: string) {
    setTypeFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const createEvent = useCallback(async () => {
    if (!activeCaseId || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: activeCaseId, title: 'Untitled event', eventType: 'other', occurredAt: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Failed to create event')
      const created = mapRow(await res.json())
      setEvents((prev) => [...prev, created])
      setSelectedId(created.id)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }, [activeCaseId, creating])

  async function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setSelectedId(null)
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error(err)
    }
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
              {usedTypes.map((t) => {
                const meta = getEventTypeMeta(t)
                const Icon = meta.icon
                return (
                  <label key={t} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <input type="checkbox" checked={typeFilter.includes(t)} onChange={() => toggleType(t)} className="accent-primary" />
                    <Icon className={cn('size-3.5', meta.color)} aria-hidden />
                    {meta.label}
                  </label>
                )
              })}
              {usedTypes.length === 0 && <p className="text-xs text-muted-foreground">No events yet.</p>}
            </div>

            {(typeFilter.length > 0 || query) && (
              <button
                type="button"
                onClick={() => { setTypeFilter([]); setQuery('') }}
                className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <X className="size-3.5" /> Clear filters
              </button>
            )}
          </div>

          <div onPointerDown={startResize} className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30" />
        </div>
      )}

      {/* List */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={createEvent}
            disabled={creating || !activeCaseId}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus className="size-4" aria-hidden />
            New Event
          </button>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{filtered.length} of {events.length} events</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <p className="px-4 py-16 text-center text-sm text-muted-foreground">Loading events…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">When</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Location</th>
                  <th className="px-4 py-2.5 font-medium">Linked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => {
                  const meta = getEventTypeMeta(e.eventType)
                  const Icon = meta.icon
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedId((prev) => (prev === e.id ? null : e.id))}
                      className={cn('cursor-pointer transition-colors hover:bg-accent/40', selected?.id === e.id && 'bg-accent/60')}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{e.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {e.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', meta.color)}>
                          <Icon className="size-3.5" aria-hidden /> {meta.label}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                        {new Date(e.occurredAt).toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{e.location || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.entityIds.length + e.evidenceIds.length}</td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <CalendarSearch className="mx-auto size-7 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">No events match the current filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail sidebar */}
      {selected && (
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event Detail</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => deleteEvent(selected.id)} className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-danger/10 hover:text-danger">
                <Trash2 className="size-3.5" /> Remove
              </button>
              <button type="button" onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close detail">
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="space-y-5 p-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Title</p>
              <input
                value={selected.title}
                onChange={(e) => updateEvent(selected.id, { title: e.target.value })}
                aria-label="Event title"
                className="w-full bg-transparent text-sm font-semibold outline-none focus:border-b focus:border-ring"
              />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Event Type</p>
              <select
                value={selected.eventType}
                onChange={(e) => updateEvent(selected.id, { eventType: e.target.value })}
                aria-label="Event type"
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-ring"
              >
                {EVENT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{getEventTypeMeta(t).label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
                <input
                  type="date"
                  value={selected.occurredAt.slice(0, 10)}
                  onChange={(e) => {
                    const time = selected.occurredAt.slice(11, 16) || '00:00'
                    updateEvent(selected.id, { occurredAt: new Date(`${e.target.value}T${time}`).toISOString() })
                  }}
                  aria-label="Event date"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-ring"
                />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
                <input
                  type="time"
                  value={selected.occurredAt.slice(11, 16)}
                  onChange={(e) => {
                    const date = selected.occurredAt.slice(0, 10)
                    updateEvent(selected.id, { occurredAt: new Date(`${date}T${e.target.value}`).toISOString() })
                  }}
                  aria-label="Event time"
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-ring"
                />
              </div>
            </div>

            <div>
              <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3" /> Location
              </p>
              <input
                value={selected.location}
                onChange={(e) => updateEvent(selected.id, { location: e.target.value })}
                placeholder="Add location…"
                aria-label="Event location"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 focus:border-b focus:border-ring"
              />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
              <textarea
                value={selected.description}
                onChange={(e) => updateEvent(selected.id, { description: e.target.value })}
                rows={3}
                aria-label="Event description"
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none focus:border-b focus:border-ring"
              />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
              <input
                value={selected.tags.join(', ')}
                onChange={(e) => updateEvent(selected.id, { tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="comma, separated, tags"
                aria-label="Event tags"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 focus:border-b focus:border-ring"
              />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
              <textarea
                value={selected.notes}
                onChange={(e) => updateEvent(selected.id, { notes: e.target.value })}
                rows={2}
                placeholder="Add notes…"
                aria-label="Event notes"
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/40 focus:border-b focus:border-ring"
              />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Related Entities · {selected.entityIds.length}
              </p>
              <div className="space-y-1">
                {caseEntities.map((ent) => (
                  <label key={ent.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={selected.entityIds.includes(ent.id)}
                      onChange={() =>
                        updateEvent(selected.id, {
                          entityIds: selected.entityIds.includes(ent.id)
                            ? selected.entityIds.filter((id) => id !== ent.id)
                            : [...selected.entityIds, ent.id],
                        })
                      }
                      className="accent-primary"
                    />
                    <EntityGlyph type={ent.type} className="size-5" />
                    <span className="truncate text-xs">{ent.label}</span>
                  </label>
                ))}
                {caseEntities.length === 0 && <p className="text-xs text-muted-foreground">No entities in this case.</p>}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Related Evidence · {selected.evidenceIds.length}
              </p>
              <div className="space-y-1">
                {caseEvidence.map((ev) => (
                  <label key={ev.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={selected.evidenceIds.includes(ev.id)}
                      onChange={() =>
                        updateEvent(selected.id, {
                          evidenceIds: selected.evidenceIds.includes(ev.id)
                            ? selected.evidenceIds.filter((id) => id !== ev.id)
                            : [...selected.evidenceIds, ev.id],
                        })
                      }
                      className="accent-primary"
                    />
                    <EvidenceTypeBadge type={ev.type} />
                    <span className="truncate text-xs">{ev.name}</span>
                  </label>
                ))}
                {caseEvidence.length === 0 && <p className="text-xs text-muted-foreground">No evidence in this case.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
