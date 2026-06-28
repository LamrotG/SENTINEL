'use client'

import { EvidenceVault } from '@/components/evidence-vault'
import { useCase } from '@/lib/case-context'

export default function EvidencePage() {
  const { activeCase } = useCase()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-5">
        <h1 className="text-sm font-semibold tracking-tight">Evidence Vault</h1>
        {activeCase && (
          <>
            <span className="font-mono text-xs text-muted-foreground">{activeCase.id}</span>
            <span className="ml-auto truncate text-xs text-muted-foreground">{activeCase.title}</span>
          </>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <EvidenceVault />
      </div>
    </div>
  )
}
