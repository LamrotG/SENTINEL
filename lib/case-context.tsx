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

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [activeCaseId, setActiveCaseId] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    fetch('/api/cases')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const arr = Array.isArray(data) ? data : []
        setCases(arr)
        setActiveCaseId((prev) => {
          if (prev && arr.some((c: CaseRow) => c.id === prev)) return prev
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
