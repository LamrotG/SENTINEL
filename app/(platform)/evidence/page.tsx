import { EvidenceVault } from '@/components/evidence-vault'

export default function EvidencePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-5">
        <h1 className="text-sm font-semibold tracking-tight">Evidence Vault</h1>
        <span className="text-xs text-muted-foreground">
          Central repository for all investigation evidence
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <EvidenceVault />
      </div>
    </div>
  )
}
