'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Panel, PriorityBadge, StatusBadge } from '@/components/primitives'
import type { InvestigationCase } from '@/lib/type'

export default function CasesPage() {
  const [cases, setCases] = useState<InvestigationCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases')
        if (!res.ok) throw new Error('Failed to fetch cases')
        const data = await res.json()
        setCases(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cases')
        console.error('Failed to fetch cases:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  if (loading) return <div className="p-6">Loading cases...</div>

  if (error) return <div className="p-6 text-danger">{error}</div>

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader title="Cases" description="Active investigations and case work." />

      <div className="p-6">
        <div className="grid gap-4">
          {cases.map((c) => (
            <Panel key={c.id} className="p-4">
              <Link href={`/cases/${c.id}`} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium truncate">{c.title}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{c.id}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground text-pretty">
                    {c.category} · Lead: {c.lead}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </Link>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  )
}