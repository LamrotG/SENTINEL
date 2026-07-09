export type CaseStatus = 'Active' | 'Suspended' | 'Closed' | 'Archived'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

export type EntityType =
  | 'person'
  | 'organization'
  | 'domain'
  | 'ip'
  | 'device'
  | 'wallet'
  | 'email'

export type EvidenceType =
  | 'Email'
  | 'PDF'
  | 'CSV'
  | 'Image'
  | 'Video'
  | 'Audio'
  | 'Document'
  | 'Link'
  | 'Log'
  | 'Archive'

export interface InvestigationCase {
  id: string
  title: string
  category: string
  status: CaseStatus
  priority: Priority
  lead: string
  team: string[]
  createdAt: string
  updatedAt: string
  summary: string
  entityIds: string[]
  evidenceIds: string[]
}

export interface Entity {
  id: string
  type: EntityType
  label: string
  subLabel?: string
  riskScore: number
  caseIds: string[]
  connections: number
  metadata: Record<string, string>
}

export interface Evidence {
  id: string
  name: string
  type: EvidenceType
  source: string
  addedAt: string
  size: string
  tags: string[]
  confidence: number
  caseId: string
  linkedEntityIds: string[]
  summary: string
}

export interface TimelineEvent {
  id: string
  timestamp: string
  title: string
  description: string
  caseId: string
  entityIds: string[]
  evidenceIds: string[]
  category: 'access' | 'communication' | 'transaction' | 'system' | 'detection'
}

// ── Events (single source of truth for the Events page & Timeline view) ──

export interface CaseEvent {
  id: string
  title: string
  description: string
  caseId: string
  entityIds: string[]
  evidenceIds: string[]
  eventType: string
  occurredAt: string
  location: string
  tags: string[]
  notes: string
}

export interface ActivityItem {
  id: string
  type: 'evidence' | 'entity' | 'timeline' | 'report' | 'note'
  actor: string
  action: string
  target: string
  caseId: string
  at: string
}

export interface AlertItem {
  id: string
  severity: 'critical' | 'high' | 'medium'
  title: string
  detail: string
  caseId: string
  at: string
}

export interface Theory {
  id: string
  title: string
  caseId: string
  confidence: number
  supporting: string[]
  contradicting: string[]
}

// ── User & Collaboration Types ──────────────────────────

export interface SentinelUser {
  id: string
  username: string
  fullName: string
  department: string
  position: string
  joinedYear: number
  createdAt: string
  updatedAt: string
}

export type CaseRole =
  | 'Lead Investigator'
  | 'Investigator'
  | 'Intelligence Analyst'
  | 'Digital Forensics Analyst'
  | 'Evidence Manager'
  | 'Reviewer'
  | 'Observer'

export type CasePermission =
  | 'view_case'
  | 'edit_case'
  | 'add_evidence'
  | 'edit_evidence'
  | 'delete_evidence'
  | 'manage_entities'
  | 'manage_timeline'
  | 'generate_reports'
  | 'invite_members'
  | 'manage_settings'

export const ROLE_DEFAULT_PERMISSIONS: Record<CaseRole, CasePermission[]> = {
  'Lead Investigator': [
    'view_case', 'edit_case', 'add_evidence', 'edit_evidence', 'delete_evidence',
    'manage_entities', 'manage_timeline', 'generate_reports', 'invite_members', 'manage_settings',
  ],
  'Investigator': [
    'view_case', 'edit_case', 'add_evidence', 'edit_evidence',
    'manage_entities', 'manage_timeline', 'generate_reports',
  ],
  'Intelligence Analyst': [
    'view_case', 'edit_case', 'manage_entities', 'manage_timeline', 'generate_reports',
  ],
  'Digital Forensics Analyst': [
    'view_case', 'add_evidence', 'edit_evidence', 'manage_entities', 'manage_timeline',
  ],
  'Evidence Manager': [
    'view_case', 'add_evidence', 'edit_evidence', 'delete_evidence',
  ],
  'Reviewer': ['view_case', 'generate_reports'],
  'Observer': ['view_case'],
}

export interface CaseMember {
  id: string
  caseId: string
  userId: string
  role: CaseRole
  permissions: CasePermission[]
  joinedAt: string
  user?: SentinelUser
}

export type InvitationType = 'collaborator' | 'viewer'
export type InvitationStatus = 'pending' | 'accepted' | 'declined'

export interface CaseInvitation {
  id: string
  caseId: string
  inviterId: string
  inviteeId: string
  type: InvitationType
  role?: CaseRole
  permissions: CasePermission[]
  status: InvitationStatus
  createdAt: string
  respondedAt?: string
  inviter?: SentinelUser
  invitee?: SentinelUser
  case?: { id: string; title: string }
}

export interface CaseViewAccess {
  id: string
  caseId: string
  userId: string
  grantedBy: string
  createdAt: string
  user?: SentinelUser
}

export type NotificationType =
  | 'collab_invitation'
  | 'view_invitation'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'removed_from_case'
  | 'permission_updated'
  | 'case_update'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  caseId?: string
  actorId?: string
  link?: string
  read: boolean
  createdAt: string
  actor?: SentinelUser
}
