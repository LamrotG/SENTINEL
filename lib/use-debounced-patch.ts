'use client'

import { useCallback, useRef } from 'react'

/**
 * Returns a `patch(id, partial)` function that coalesces rapid successive
 * edits (e.g. keystrokes in a detail-sidebar field) into a single PATCH
 * request per `delay` window, merging pending fields so nothing is dropped.
 */
export function useDebouncedPatch<T extends object>(url: (id: string) => string, delay = 500) {
  const pending = useRef<Record<string, Partial<T>>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  return useCallback(
    (id: string, patch: Partial<T>) => {
      pending.current[id] = { ...pending.current[id], ...patch }
      if (timers.current[id]) clearTimeout(timers.current[id])
      timers.current[id] = setTimeout(() => {
        const toSend = pending.current[id]
        delete pending.current[id]
        fetch(url(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        }).catch((err) => console.error('Failed to save', err))
      }, delay)
    },
    [url, delay],
  )
}
