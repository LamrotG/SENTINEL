'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, X } from 'lucide-react'

export function InvitationActions({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [done, setDone] = useState<'accepted' | 'declined' | null>(null)
  const [error, setError] = useState('')

  async function respond(action: 'accept' | 'decline') {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to respond to invitation')
      }
      setDone(action === 'accept' ? 'accepted' : 'declined')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to invitation')
    } finally {
      setLoading(null)
    }
  }

  if (done) {
    return (
      <p className="text-sm font-medium">
        {done === 'accepted' ? 'You joined this case.' : 'Invitation declined.'}
      </p>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => respond('accept')}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {loading === 'accept' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
          Accept Invitation
        </button>
        <button
          type="button"
          onClick={() => respond('decline')}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          {loading === 'decline' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <X className="size-4" aria-hidden />}
          Decline
        </button>
      </div>
    </div>
  )
}
