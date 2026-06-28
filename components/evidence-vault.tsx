'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, FileSearch, Search, X } from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  Panel,
  Tag,
} from '@/components/primitives'
import { entities, evidence as initialEvidence } from '@/lib/data'
import { useCase } from '@/lib/case-context'
import type { Evidence } from '@/lib/types'
import type { EvidenceType } from '@/lib/types'
import { cn } from '@/lib/utils'

const types: EvidenceType[] = ['Email', 'PDF', 'CSV', 'Image', 'Log', 'Archive']

const MIN_FILTER_W = 180
const MAX_FILTER_W = 320
const DEFAULT_FILTER_W = 224

export function EvidenceVault() {
  const { activeCaseId } = useCase()
  const [evidenceData, setEvidenceData] = useState<Evidence[]>([...initialEvidence])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<EvidenceType[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  function updateEvidence(id: string, patch: Partial<Evidence>) {
    setEvidenceData((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const filtered = useMemo(() => {
    return evidenceData.filter((e) => {
      if (activeCaseId && e.caseId !== activeCaseId) return false
      if (typeFilter.length && !typeFilter.includes(e.type)) return false
      if (
        query &&
        !`${e.name} ${e.source} ${e.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false
      return true
    })
  }, [query, typeFilter, activeCaseId, evidenceData])

  const selected = selectedId ? filtered.find((e) => e.id === selectedId) ?? null : null
  const linkedEntities = selected
    ? selected.linkedEntityIds
        .map((id) => entities.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : []

  function toggleType(t: EvidenceType) {
    setTypeFilter((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
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
              File Type
            </p>
            <div className="space-y-1">
              {types.map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={typeFilter.includes(t)}
                    onChange={() => toggleType(t)}
                    className="accent-primary"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {(typeFilter.length > 0 || query) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter([])
                setQuery('')
              }}
              className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <X className="size-3.5" /> Clear filters
            </button>
          )}

          {/* Resize handle */}
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

      {/* Table */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="relative max-w-sm flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search evidence…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {evidenceData.length} items
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">File Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Source</th>
                <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Confidence</th>
                <th className="px-4 py-2.5 font-medium">Linked</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Added</th>
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
                    <p className="font-medium">{e.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <EvidenceTypeBadge type={e.type} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{e.source}</td>
                  <td className="hidden w-36 px-4 py-3 xl:table-cell">
                    <ConfidenceBar value={e.confidence} showLabel={false} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.linkedEntityIds.length}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                    {e.addedAt}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <FileSearch className="mx-auto size-7 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No evidence matches the current filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector — only visible when something selected */}
      {selected && (
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Evidence Preview
            </p>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-5 p-4">
            <div>
              <div className="flex items-center gap-2">
                <EvidenceTypeBadge type={selected.type} />
                <span className="text-xs text-muted-foreground">{selected.size}</span>
              </div>
              <input
                value={selected.name}
                onChange={(e) => updateEvidence(selected.id, { name: e.target.value })}
                aria-label="Evidence name"
                className="mt-2 w-full bg-transparent text-sm font-semibold outline-none focus:border-b focus:border-ring"
              />
            </div>

            <div className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed border-border bg-elevated/50">
              <div className="text-center">
                <FileSearch className="mx-auto size-7 text-muted-foreground/60" aria-hidden />
                <p className="mt-2 text-xs text-muted-foreground">
                  Secure preview · {selected.type}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</p>
              <textarea
                value={selected.summary}
                onChange={(e) => updateEvidence(selected.id, { summary: e.target.value })}
                rows={3}
                aria-label="Evidence summary"
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none focus:border-b focus:border-ring"
              />
            </div>

            <EditableMeta label="Source" value={selected.source} onChange={(v) => updateEvidence(selected.id, { source: v })} />
            <Meta label="Added" value={selected.addedAt} mono />
            <Meta label="Case" value={selected.caseId} mono />

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Confidence Score
              </p>
              <ConfidenceBar value={selected.confidence} />
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Extracted Entities · {linkedEntities.length}
              </p>
              <ul className="space-y-1.5">
                {linkedEntities.map((ent) => (
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
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterRadio({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm',
        active ? 'text-foreground' : 'text-muted-foreground hover:bg-accent',
      )}
    >
      <span
        className={cn(
          'flex size-3.5 items-center justify-center rounded-full border',
          active ? 'border-primary' : 'border-muted-foreground/50',
        )}
      >
        {active && <span className="size-1.5 rounded-full bg-primary" />}
      </span>
      <span className="truncate font-mono text-xs">{label}</span>
    </button>
  )
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn('text-xs', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

function EditableMeta({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-32 bg-transparent text-right text-xs outline-none focus:border-b focus:border-ring"
      />
    </div>
  )
}
