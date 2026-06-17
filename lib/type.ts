export type CaseStatus = 'Active' | 'Suspended' | 'Closed'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

export type EntityType =
  | 'person'
  | 'organization'
  | 'domain'
  | 'ip'
  | 'device'
  | 'wallet'
  | 'email'

export type EvidenceType = 'Email' | 'PDF' | 'CSV' | 'Image' | 'Log' | 'Archive'

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
