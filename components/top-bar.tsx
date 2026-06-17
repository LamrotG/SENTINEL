'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  ChevronDown,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { cases } from '@/lib/data'
import { cn } from '@/lib/utils'

export function TopBar() {
  const [open, setOpen] = useState(false)
  const [activeCase, setActiveCase] = useState(cases[0])

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      {/* Case switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-elevated"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="max-w-52 truncate">{activeCase.id}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-full z-20 mt-1.5 w-80 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switch case
              </p>
              {cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCase(c)
                    setOpen(false)
                  }}
                  className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left hover:bg-accent"
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-3.5 shrink-0',
                      c.id === activeCase.id
                        ? 'text-primary'
                        : 'text-transparent',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {c.title}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {c.id}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Global search */}
      <div className="relative flex-1 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search cases, entities, evidence…"
          className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-elevated hover:text-foreground"
        aria-label="Filters"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-elevated hover:text-foreground"
        aria-label="Alerts"
      >
        <Bell className="size-4" aria-hidden />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
      </button>

      <Link
        href="/cases/CAS-2026-0148"
        className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="size-4" aria-hidden />
        New Case
      </Link>
    </header>
  )
}
