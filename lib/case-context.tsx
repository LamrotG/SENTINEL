'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface CaseRow {
  id: string
  title: string
  category: string
  status: string
  priority: string
  lead_name: string
  lead_id: string
  my_role?: string
  created_at: string
  updated_at: string
  summary?: string
}

interface CaseContextValue {
  activeCaseId: string
  setActiveCaseId: (id: string) => void
  cases: CaseRow[]
  activeCase: CaseRow | undefined
  loading: boolean
  reload: () => void
}

const CaseContext = createContext<CaseContextValue | null>(null)

const STORAGE_KEY = 'sentinel:activeCaseId'

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [activeCaseId, setActiveCaseIdState] = useState('')
  const [loading, setLoading] = useState(true)

  // Selecting a case anywhere persists it, so every other page (and a page
  // refresh) picks up the same case instead of resetting to the first one.
  const setActiveCaseId = useCallback((id: string) => {
    setActiveCaseIdState(id)
    try {
      window.localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // localStorage unavailable (private mode, etc.) — selection just won't persist.
    }
  }, [])

  const reload = useCallback(() => {
    fetch('/api/cases')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const arr = Array.isArray(data) ? data : []
        setCases(arr)
        setActiveCaseIdState((prev) => {
          if (prev && arr.some((c: CaseRow) => c.id === prev)) return prev
          let stored = ''
          try {
            stored = window.localStorage.getItem(STORAGE_KEY) ?? ''
          } catch {
            // ignore
          }
          if (stored && arr.some((c: CaseRow) => c.id === stored)) return stored
          return arr[0]?.id ?? ''
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const activeCase = cases.find((c) => c.id === activeCaseId)

  return (
    <CaseContext.Provider value={{ activeCaseId, setActiveCaseId, cases, activeCase, loading, reload }}>
      {children}
    </CaseContext.Provider>
  )
}

export function useCase() {
  const ctx = useContext(CaseContext)
  if (!ctx) throw new Error('useCase must be used within CaseProvider')
  return ctx
}
