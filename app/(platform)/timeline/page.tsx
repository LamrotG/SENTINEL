import { TimelineView } from '@/components/timeline-view'

export default function TimelinePage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-5">
        <h1 className="text-sm font-semibold tracking-tight">
          Timeline Reconstruction
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          CAS-2026-0148
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          Chronological sequence of events
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <TimelineView />
      </div>
    </div>
  )
}
