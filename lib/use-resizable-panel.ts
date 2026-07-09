'use client'

import { useCallback, useRef, useState } from 'react'

interface UseResizablePanelOptions {
  /** Width of the panel while collapsed — also the minimum drag width. */
  collapsedWidth: number
  /** Width of the panel while expanded by default — also the maximum drag width. */
  defaultWidth: number
  initialCollapsed?: boolean
}

/**
 * Shared drag-to-resize + collapse state for the app's left-anchored panels
 * (main nav, workspace tools, evidence/timeline/events filters).
 * Attach `containerRef` to the panel element whose left edge is the resize
 * anchor — width is measured from that edge so the drag tracks the cursor
 * correctly regardless of where the panel sits in the layout.
 */
export function useResizablePanel({ collapsedWidth, defaultWidth, initialCollapsed = false }: UseResizablePanelOptions) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [width, setWidth] = useState(defaultWidth)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const resizing = useRef(false)

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      resizing.current = true
      const left = containerRef.current?.getBoundingClientRect().left ?? 0
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: PointerEvent) => {
        if (!resizing.current) return
        setWidth(Math.min(defaultWidth, Math.max(collapsedWidth, ev.clientX - left)))
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
    },
    [collapsedWidth, defaultWidth],
  )

  return {
    containerRef,
    width,
    currentWidth: collapsed ? collapsedWidth : width,
    collapsed,
    setCollapsed,
    startResize,
  }
}
