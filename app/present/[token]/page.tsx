'use client'

import { use, useEffect, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { PresentationContent } from '@/components/presentation-content'
import type { Entity, Evidence, InvestigationCase, Theory, TimelineEvent } from '@/lib/types'

interface PresentationPayload {
  case: InvestigationCase
  entities: Entity[]
  evidence: Evidence[]
  timeline: TimelineEvent[]
  theories: Theory[]
}

export default function PublicPresentationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<PresentationPayload | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/present/${token}`)
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body.error || 'Failed to load presentation')
        setData(body)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load presentation'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">{error || 'This link is invalid or has been revoked.'}</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto scrollbar-thin bg-background">
      <div className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-background/90 px-5 backdrop-blur">
        <span className="rounded-full bg-info/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-info">
          Presentation Mode · View Only
        </span>
      </div>
      <PresentationContent
        activeCase={data.case}
        caseEntities={data.entities}
        caseEvidence={data.evidence}
        caseTimeline={data.timeline}
        caseTheories={data.theories}
      />
    </div>
  )
}
