'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Panel, SectionTitle, StatusBadge, PriorityBadge } from '@/components/primitives'
import { cn } from '@/lib/utils'
import type { CaseRole, CasePermission } from '@/lib/type'
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/type'

const ROLES: CaseRole[] = [
  'Investigator',
  'Intelligence Analyst',
  'Digital Forensics Analyst',
  'Evidence Manager',
  'Reviewer',
  'Observer',
]

const ALL_PERMISSIONS: { key: CasePermission; label: string }[] = [
  { key: 'view_case', label: 'View Case' },
  { key: 'edit_case', label: 'Edit Case' },
  { key: 'add_evidence', label: 'Add Evidence' },
  { key: 'edit_evidence', label: 'Edit Evidence' },
  { key: 'delete_evidence', label: 'Delete Evidence' },
  { key: 'manage_entities', label: 'Manage Entities' },
  { key: 'manage_timeline', label: 'Manage Timeline' },
  { key: 'generate_reports', label: 'Generate Reports' },
  { key: 'invite_members', label: 'Invite Members' },
  { key: 'manage_settings', label: 'Manage Settings' },
]

type Tab = 'general' | 'team' | 'viewers' | 'invitations' | 'permissions'

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'general', label: 'General', icon: Shield },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'viewers', label: 'View Access', icon: Eye },
  { id: 'invitations', label: 'Invitations', icon: UserPlus },
  { id: 'permissions', label: 'Permissions', icon: Shield },
]

export default function CaseSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [caseData, setCaseData] = useState<Record<string, unknown> | null>(null)
  const [members, setMembers] = useState<Record<string, unknown>[]>([])
  const [invitations, setInvitations] = useState<Record<string, unknown>[]>([])
  const [viewers, setViewers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [caseRes, membersRes, invRes, viewRes] = await Promise.all([
        fetch(`/api/cases/${caseId}`),
        fetch(`/api/cases/${caseId}/members`),
        fetch(`/api/cases/${caseId}/invitations`),
        fetch(`/api/cases/${caseId}/viewers`),
      ])
      const caseJson = await caseRes.json()
      setCaseData(caseJson.case ?? caseJson)
      setMembers(await membersRes.json())
      setInvitations(await invRes.json())
      setViewers(await viewRes.json())
    } catch {
      console.error('Failed to load case settings')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => { load() }, [load])

  // Best-effort near-real-time invitation status: the app has no push/websocket
  // layer, so poll while the Invitations tab is open instead of requiring a
  // manual refresh to see when a receiver accepts/declines.
  useEffect(() => {
    if (activeTab !== 'invitations') return
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [activeTab, load])

  if (loading || !caseData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader
        title="Case Settings"
        description={`${caseData.title} · ${caseData.id}`}
        actions={
          <Link href={`/cases/${caseId}`} className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-elevated">
            <ArrowLeft className="size-4" aria-hidden /> Back to Case
          </Link>
        }
      />

      <div className="p-6">
        <div className="mb-6 flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors', activeTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
                <Icon className="size-4" aria-hidden /> {t.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'general' && <GeneralTab caseData={caseData} caseId={caseId} />}
        {activeTab === 'team' && <TeamTab members={members} caseId={caseId} leadId={caseData.lead_id as string} onRefresh={load} />}
        {activeTab === 'viewers' && <ViewersTab viewers={viewers} caseId={caseId} onRefresh={load} />}
        {activeTab === 'invitations' && <InvitationsTab invitations={invitations} caseId={caseId} onRefresh={load} />}
        {activeTab === 'permissions' && <PermissionsTab />}
      </div>
    </div>
  )
}

function GeneralTab({ caseData, caseId }: { caseData: Record<string, unknown>; caseId: string }) {
  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="p-5">
        <SectionTitle>Case Information</SectionTitle>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Case ID</label>
            <input defaultValue={caseData.id as string} disabled className="h-10 w-full cursor-not-allowed rounded-md border border-border bg-background px-3 text-sm opacity-60 outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
            <input defaultValue={caseData.title as string} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Summary</label>
            <textarea defaultValue={caseData.summary as string} rows={3} className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2">
                <StatusBadge status={caseData.status as 'Active'} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Priority</label>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={caseData.priority as 'High'} />
              </div>
            </div>
          </div>
        </div>
        <button type="button" className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save Changes
        </button>
      </Panel>

      <Panel className="p-5">
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-elevated/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Archive Case</p>
              <p className="text-xs text-muted-foreground">Move case to archive. Can be reopened later.</p>
            </div>
            <button type="button" className="rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/20">Archive</button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-danger/30 bg-danger/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-danger">Delete Case</p>
              <p className="text-xs text-muted-foreground">Permanently delete this case and all associated data.</p>
            </div>
            <button type="button" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20">Delete</button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function TeamTab({ members, caseId, leadId, onRefresh }: { members: Record<string, unknown>[]; caseId: string; leadId: string; onRefresh: () => void }) {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="p-5">
        <div className="flex items-center justify-between">
          <SectionTitle>Team Members · {members.length}</SectionTitle>
          <button type="button" onClick={() => setInviteOpen(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <UserPlus className="size-3.5" /> Invite Collaborator
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {members.map((m) => (
            <div key={m.id as string} className={cn('flex items-center gap-3 rounded-md border px-4 py-3', m.user_id === leadId ? 'border-primary/30 bg-primary/5' : 'border-border bg-elevated/50')}>
              <span className="flex size-9 items-center justify-center rounded-full bg-info/20 text-xs font-semibold text-info">
                {(m.full_name as string).split(' ').map((n: string) => n[0]).join('')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{m.full_name as string}</p>
                  {m.user_id === leadId && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">Lead</span>}
                </div>
                <p className="text-xs text-muted-foreground">@{m.username as string} · {m.role as string}</p>
              </div>
              {m.user_id !== leadId && (
                <button type="button" onClick={async () => {
                  await fetch(`/api/cases/${caseId}/members`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: m.id }) })
                  onRefresh()
                }} className="text-muted-foreground hover:text-danger" aria-label="Remove member">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {inviteOpen && <InviteModal caseId={caseId} type="collaborator" onClose={() => setInviteOpen(false)} onDone={() => { setInviteOpen(false); onRefresh() }} />}
    </div>
  )
}

function ViewersTab({ viewers, caseId, onRefresh }: { viewers: Record<string, unknown>[]; caseId: string; onRefresh: () => void }) {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="p-5">
        <div className="flex items-center justify-between">
          <SectionTitle>View-Only Access · {viewers.length}</SectionTitle>
          <button type="button" onClick={() => setInviteOpen(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Eye className="size-3.5" /> Share View Access
          </button>
        </div>
        {viewers.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No view-only users. Share access to allow read-only viewing of this case.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {viewers.map((v) => (
              <div key={v.id as string} className="flex items-center gap-3 rounded-md border border-border bg-elevated/50 px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {(v.full_name as string).split(' ').map((n: string) => n[0]).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{v.full_name as string}</p>
                  <p className="text-xs text-muted-foreground">@{v.username as string} · {v.department as string} · View Only</p>
                </div>
                <button type="button" onClick={async () => {
                  await fetch(`/api/cases/${caseId}/viewers`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessId: v.id }) })
                  onRefresh()
                }} className="text-muted-foreground hover:text-danger" aria-label="Remove viewer">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {inviteOpen && <InviteModal caseId={caseId} type="viewer" onClose={() => setInviteOpen(false)} onDone={() => { setInviteOpen(false); onRefresh() }} />}
    </div>
  )
}

function InvitationsTab({ invitations, caseId, onRefresh }: { invitations: Record<string, unknown>[]; caseId: string; onRefresh: () => void }) {
  const pending = invitations.filter((i) => i.status === 'pending')
  const resolved = invitations.filter((i) => i.status !== 'pending')

  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="p-5">
        <SectionTitle>Pending Invitations · {pending.length}</SectionTitle>
        {pending.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No pending invitations.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {pending.map((inv) => (
              <div key={inv.id as string} className="flex items-center gap-3 rounded-md border border-warning/30 bg-warning/5 px-4 py-3">
                <Clock className="size-4 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.invitee_name as string}</p>
                  <p className="text-xs text-muted-foreground">
                    @{inv.invitee_username as string} · {inv.type as string} · {inv.role ? `${inv.role}` : 'View Only'}
                  </p>
                </div>
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">Pending</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {resolved.length > 0 && (
        <Panel className="p-5">
          <SectionTitle>Invitation History</SectionTitle>
          <div className="mt-4 space-y-2">
            {resolved.map((inv) => (
              <div key={inv.id as string} className="flex items-center gap-3 rounded-md border border-border bg-elevated/50 px-4 py-3">
                {inv.status === 'accepted' ? <Check className="size-4 text-success" /> : <X className="size-4 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.invitee_name as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.type as string} · {inv.role ? `${inv.role}` : 'View Only'}
                  </p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', inv.status === 'accepted' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>
                  {inv.status === 'accepted' ? 'Accepted' : 'Declined'}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  )
}

function PermissionsTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="p-5">
        <SectionTitle>Role Permissions Matrix</SectionTitle>
        <p className="mt-2 text-xs text-muted-foreground">Default permissions for each case role. Custom permissions can be set per-member when inviting.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Permission</th>
                {ROLES.map((r) => <th key={r} className="px-2 py-2 font-medium text-center">{r.split(' ')[0]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ALL_PERMISSIONS.map((p) => (
                <tr key={p.key}>
                  <td className="px-3 py-2 font-medium">{p.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-2 text-center">
                      {ROLE_DEFAULT_PERMISSIONS[r].includes(p.key) ? (
                        <Check className="mx-auto size-3.5 text-success" />
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function InviteModal({ caseId, type, onClose, onDone }: { caseId: string; type: 'collaborator' | 'viewer'; onClose: () => void; onDone: () => void }) {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<CaseRole>('Investigator')
  const [selectedPerms, setSelectedPerms] = useState<CasePermission[]>(ROLE_DEFAULT_PERMISSIONS['Investigator'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([])

  async function searchUsers(q: string) {
    if (q.length < 2) { setSearchResults([]); return }
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setSearchResults(Array.isArray(data) ? data : [])
  }

  function handleRoleChange(r: CaseRole) {
    setRole(r)
    setSelectedPerms(ROLE_DEFAULT_PERMISSIONS[r])
  }

  async function handleSubmit() {
    if (!username) { setError('Enter a username'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/cases/${caseId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          type,
          role: type === 'collaborator' ? role : null,
          permissions: type === 'collaborator' ? selectedPerms : ['view_case'],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to invite'); return }
      onDone()
    } catch {
      setError('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">{type === 'viewer' ? 'Share View Access' : 'Invite Collaborator'}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </div>

        <div className="space-y-4 p-5">
          {error && <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Username</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={username} onChange={(e) => { setUsername(e.target.value); searchUsers(e.target.value) }}
                placeholder="Search by username or name…"
                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring" />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-border bg-popover">
                {searchResults.map((u) => (
                  <button key={u.id as string} type="button" onClick={() => { setUsername(u.username as string); setSearchResults([]) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent">
                    <span className="font-medium">{u.full_name as string}</span>
                    <span className="text-xs text-muted-foreground">@{u.username as string}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {type === 'collaborator' && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role</label>
                <select value={role} onChange={(e) => handleRoleChange(e.target.value as CaseRole)} aria-label="Member role"
                  className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm outline-none focus:border-primary">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Permissions</label>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent">
                      <input type="checkbox" checked={selectedPerms.includes(p.key)}
                        onChange={(e) => setSelectedPerms((prev) => e.target.checked ? [...prev, p.key] : prev.filter((x) => x !== p.key))}
                        className="accent-primary" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  )
}
