'use client'

import { useEffect, useState } from 'react'
import {
  Globe,
  Key,
  Laptop,
  Lock,
  Monitor,
  Shield,
  Smartphone,
  User,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Panel, SectionTitle } from '@/components/primitives'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
] as const

type Tab = (typeof tabs)[number]['id']

const mockSessions = [
  {
    id: 's1',
    device: 'Windows 11 — Chrome 124',
    icon: Laptop,
    ip: '192.168.1.42',
    location: 'Addis Ababa, ET',
    lastActive: 'Now (current session)',
    current: true,
  },
  {
    id: 's2',
    device: 'macOS 15 — Safari 18',
    icon: Monitor,
    ip: '10.0.4.18',
    location: 'Rotterdam, NL',
    lastActive: '2 hours ago',
    current: false,
  },
  {
    id: 's3',
    device: 'iPhone 16 — Sentinel Mobile',
    icon: Smartphone,
    ip: '172.16.8.201',
    location: 'Addis Ababa, ET',
    lastActive: '1 day ago',
    current: false,
  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account')
  const [sessionUser, setSessionUser] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) setSessionUser(data)
    }).catch(() => {})
  }, [])

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <PageHeader
        title="Settings"
        description="Account configuration, security policies, and session management."
      />

      <div className="p-6">
        {/* Tab bar */}
        <div className="mb-6 flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Account tab */}
        {activeTab === 'account' && (
          <div className="max-w-2xl space-y-6">
            <Panel className="p-5">
              <SectionTitle>Profile Information</SectionTitle>
              <div className="mt-4 space-y-4">
                <Field label="Full Name" defaultValue={sessionUser?.fullName ?? ''} />
                <Field label="Username" defaultValue={sessionUser?.username ?? ''} disabled />
                <Field label="Position" defaultValue={sessionUser?.position ?? ''} disabled />
                <Field label="Department" defaultValue={sessionUser?.department ?? ''} disabled />
              </div>
              <button
                type="button"
                className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </button>
            </Panel>

            <Panel className="p-5">
              <SectionTitle>Preferences</SectionTitle>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">Interface appearance</p>
                  </div>
                  <span className="rounded-md border border-border bg-elevated px-3 py-1.5 text-xs font-medium">
                    Dark (System Default)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Timezone</p>
                    <p className="text-xs text-muted-foreground">Used for timestamps and scheduling</p>
                  </div>
                  <span className="rounded-md border border-border bg-elevated px-3 py-1.5 text-xs font-medium">
                    UTC+3 (EAT)
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        )}

        {/* Security tab */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            <Panel className="p-5">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-warning" aria-hidden />
                <SectionTitle>Change Password</SectionTitle>
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Current Password" type="password" />
                <Field label="New Password" type="password" />
                <Field label="Confirm New Password" type="password" />
              </div>
              <button
                type="button"
                className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Update Password
              </button>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-success" aria-hidden />
                <SectionTitle>Two-Factor Authentication</SectionTitle>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Add an extra layer of security to your account. Required for Tier 3+ clearance.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-md border border-success/30 bg-success/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-success/15">
                    <Shield className="size-4 text-success" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-medium">2FA is enabled</p>
                    <p className="text-xs text-muted-foreground">Authenticator app configured</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-border bg-elevated px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Reconfigure
                </button>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-info" aria-hidden />
                <SectionTitle>Login Policies</SectionTitle>
              </div>
              <div className="mt-4 space-y-3">
                <PolicyRow label="Session timeout" value="8 hours" />
                <PolicyRow label="Max concurrent sessions" value="3" />
                <PolicyRow label="IP allowlisting" value="Disabled" />
                <PolicyRow label="Forced password rotation" value="90 days" />
                <PolicyRow label="Failed login lockout" value="5 attempts" />
              </div>
            </Panel>
          </div>
        )}

        {/* Sessions tab */}
        {activeTab === 'sessions' && (
          <div className="max-w-2xl space-y-6">
            <Panel className="p-5">
              <div className="flex items-center justify-between">
                <SectionTitle>Active Sessions</SectionTitle>
                <button
                  type="button"
                  className="rounded-md border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20"
                >
                  Revoke All Other Sessions
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {mockSessions.map((s) => {
                  const Icon = s.icon
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex items-center gap-4 rounded-md border px-4 py-3',
                        s.current
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-elevated/50',
                      )}
                    >
                      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-card">
                        <Icon className="size-5 text-muted-foreground" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{s.device}</p>
                          {s.current && (
                            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.ip} · {s.location} · {s.lastActive}
                        </p>
                      </div>
                      {!s.current && (
                        <button
                          type="button"
                          className="shrink-0 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-danger hover:bg-accent"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </Panel>

            <Panel className="p-5">
              <SectionTitle>Login History</SectionTitle>
              <div className="mt-4 overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-elevated text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">IP Address</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <LoginRow time="Jun 28, 2026 · 08:14" ip="192.168.1.42" status="success" />
                    <LoginRow time="Jun 27, 2026 · 19:02" ip="192.168.1.42" status="success" />
                    <LoginRow time="Jun 27, 2026 · 14:31" ip="10.0.4.18" status="success" />
                    <LoginRow time="Jun 26, 2026 · 09:55" ip="192.168.1.42" status="success" />
                    <LoginRow time="Jun 25, 2026 · 22:17" ip="203.45.67.8" status="failed" />
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  defaultValue,
  disabled,
  type = 'text',
}: {
  label: string
  defaultValue?: string
  disabled?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-1 focus:ring-ring',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      />
    </div>
  )
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-elevated/50 px-4 py-2.5">
      <span className="text-sm">{label}</span>
      <span className="text-xs font-medium text-muted-foreground">{value}</span>
    </div>
  )
}

function LoginRow({ time, ip, status }: { time: string; ip: string; status: 'success' | 'failed' }) {
  return (
    <tr>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{time}</td>
      <td className="px-3 py-2 font-mono text-xs">{ip}</td>
      <td className="px-3 py-2">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            status === 'success'
              ? 'bg-success/15 text-success'
              : 'bg-danger/15 text-danger',
          )}
        >
          {status === 'success' ? 'Authenticated' : 'Failed'}
        </span>
      </td>
    </tr>
  )
}
