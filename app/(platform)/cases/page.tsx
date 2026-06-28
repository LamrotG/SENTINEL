'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Filter } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Panel, PriorityBadge, StatusBadge } from '@/components/primitives'
import { cn } from '@/lib/utils'

type CaseRow = {
  id: string; title: string; category: string; status: string; priority: string;
  lead_name: string; my_role?: string; created_at: string;
}

type RoleFilter = 'all' | 'lead' | 'collaborator' | 'viewer'
type SortMode = 'newest' | 'oldest'

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortMode>('newest')

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then((data) => setCases(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = cases

    if (roleFilter === 'lead') result = result.filter((c) => c.my_role === 'Lead Investigator')
    else if (roleFilter === 'collaborator') result = result.filter((c) => c.my_role && c.my_role !== 'Lead Investigator')
    else if (roleFilter === 'viewer') result = result.filter((c) => !c.my_role)

    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)
    if (priorityFilter !== 'all') result = result.filter((c) => c.priority === priorityFilter)

    result = [...result].sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sort === 'newest' ? db - da : da - db
    })

    return result
  }, [cases, roleFilter, statusFilter, priorityFilter, sort])

  if (loading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin">
        <PageHeader title="Cases" description="Your investigations and case work." />
        <div className="p-6 text-sm text-muted-foreground">Loading cases…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin">
        <PageHeader title="Cases" description="Your investigations and case work." />
        <div className="p-6 text-sm text-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader title="Cases" description="Your investigations and case work." />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
        <Filter className="size-4 text-muted-foreground" />

        <FilterChips label="Role" value={roleFilter} onChange={setRoleFilter as (v: string) => void}
          options={[{ value: 'all', label: 'All My Cases' }, { value: 'lead', label: 'Lead' }, { value: 'collaborator', label: 'Collaborator' }, { value: 'viewer', label: 'View Only' }]} />

        <span className="h-5 w-px bg-border" />

        <FilterChips label="Status" value={statusFilter} onChange={setStatusFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'Active', label: 'Active' }, { value: 'Suspended', label: 'Suspended' }, { value: 'Closed', label: 'Closed' }]} />

        <span className="h-5 w-px bg-border" />

        <FilterChips label="Priority" value={priorityFilter} onChange={setPriorityFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'Critical', label: 'Critical' }, { value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }]} />

        <span className="h-5 w-px bg-border" />

        <FilterChips label="Sort" value={sort} onChange={setSort as (v: string) => void}
          options={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }]} />

        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} case{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4 p-6">
        {filtered.map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} className="group block">
            <Panel className="p-4 transition-colors hover:bg-accent/40">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                    <StatusBadge status={c.status as 'Active'} />
                    <PriorityBadge priority={c.priority as 'High'} />
                    {c.my_role && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {c.my_role}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium group-hover:text-primary">{c.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.category} · Lead: {c.lead_name}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Panel>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No cases match the current filters.</p>
        )}
      </div>
    </div>
  )
}

function FilterChips({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn('rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
            value === o.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
