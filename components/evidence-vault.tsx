'use client'

import { useMemo, useState } from 'react'
import { FileSearch, Search, X } from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  EvidenceTypeBadge,
  Panel,
  Tag,
} from '@/components/primitives'
import { cases, entities, evidence } from '@/lib/data'
import type { EvidenceType } from '@/lib/types'
import { cn } from '@/lib/utils'

const types: EvidenceType[] = ['Email', 'PDF', 'CSV', 'Image', 'Log', 'Archive']

export function EvidenceVault() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<EvidenceType[]>([])
  const [caseFilter, setCaseFilter] = useState<string>('all')
  const [selectedId, setSelectedId] = useState<string>(evidence[0].id)

  const filtered = useMemo(() => {
    return evidence.filter((e) => {
      if (caseFilter !== 'all' && e.caseId !== caseFilter) return false
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
  }, [query, typeFilter, caseFilter])

  const selected =
    filtered.find((e) => e.id === selectedId) ?? filtered[0] ?? null
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

  return (
    <div className="flex h-full">
      {/* Filters */}
      <div className="w-56 shrink-0 overflow-y-auto scrollbar-thin border-r border-border bg-card p-4">
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

        <div className="mt-5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Case
          </p>
          <div className="space-y-1">
            <FilterRadio
              label="All cases"
              active={caseFilter === 'all'}
              onClick={() => setCaseFilter('all')}
            />
            {cases.map((c) => (
              <FilterRadio
                key={c.id}
                label={c.id}
                active={caseFilter === c.id}
                onClick={() => setCaseFilter(c.id)}
              />
            ))}
          </div>
        </div>

        {(typeFilter.length > 0 || caseFilter !== 'all' || query) && (
          <button
            type="button"
            onClick={() => {
              setTypeFilter([])
              setCaseFilter('all')
              setQuery('')
            }}
            className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <X className="size-3.5" /> Clear filters
          </button>
        )}
      </div>

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
            {filtered.length} of {evidence.length} items
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">File Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  Source
                </th>
                <th className="hidden px-4 py-2.5 font-medium xl:table-cell">
                  Confidence
                </th>
                <th className="px-4 py-2.5 font-medium">Linked</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
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
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {e.source}
                  </td>
                  <td className="hidden w-36 px-4 py-3 xl:table-cell">
                    <ConfidenceBar value={e.confidence} showLabel={false} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.linkedEntityIds.length}
                  </td>
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

      {/* Preview */}
      <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin border-l border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence Preview
          </p>
        </div>
        {selected ? (
          <div className="space-y-5 p-4">
            <div>
              <div className="flex items-center gap-2">
                <EvidenceTypeBadge type={selected.type} />
                <span className="text-xs text-muted-foreground">
                  {selected.size}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-pretty">
                {selected.name}
              </p>
            </div>

            <div className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed border-border bg-elevated/50">
              <div className="text-center">
                <FileSearch
                  className="mx-auto size-7 text-muted-foreground/60"
                  aria-hidden
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Secure preview · {selected.type}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/80 text-pretty">
              {selected.summary}
            </p>

            <Meta label="Source" value={selected.source} />
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
                      <p className="truncate text-[10px] text-muted-foreground">
                        {ent.subLabel}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">No item selected.</p>
        )}
      </div>
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
