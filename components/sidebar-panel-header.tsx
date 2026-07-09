'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

/**
 * Shared header for the app's left-side "Tools"/"Filters" panels
 * (Workspace, Evidence, Timeline, Events) so heading typography, the
 * divider beneath it, and the collapse affordance stay pixel-identical.
 */
export function SidebarPanelHeader({ label, onCollapse }: { label: string; onCollapse: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <button
        type="button"
        onClick={onCollapse}
        title={`Hide ${label.toLowerCase()}`}
        aria-label={`Hide ${label.toLowerCase()}`}
        className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <PanelLeftClose className="size-3.5" aria-hidden />
      </button>
    </div>
  )
}

/**
 * Collapsed state of a panel: the entire rail is clickable to expand,
 * not just the icon.
 */
export function CollapsedPanelRail({ label, onExpand }: { label: string; onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      title={`Show ${label.toLowerCase()}`}
      aria-label={`Show ${label.toLowerCase()}`}
      className="flex h-full shrink-0 flex-col items-center border-r border-border bg-card px-1.5 pt-3 text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <PanelLeftOpen className="size-3.5 shrink-0" aria-hidden />
    </button>
  )
}
