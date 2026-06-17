import { WorkspaceCanvas } from '@/components/workspace/workspace-canvas'
import { StatusBadge } from '@/components/primitives'

export default function WorkspacePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-5">
        <h1 className="text-sm font-semibold tracking-tight">
          Investigation Workspace
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          CAS-2026-0148
        </span>
        <StatusBadge status="Active" />
        <span className="ml-auto text-xs text-muted-foreground">
          Business Email Compromise — EastGate Logistics
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <WorkspaceCanvas />
      </div>
    </div>
  )
}
