import type { EntityType } from './types'

export type NodeKind = 'note' | 'evidence' | 'entity' | 'theory'

export interface CanvasNode {
  id: string
  kind: NodeKind
  x: number
  y: number
  w: number
  h: number
  title: string
  body?: string
  entityType?: EntityType
  evidenceType?: string
  confidence?: number
  riskScore?: number
  noteTone?: 'blue' | 'amber' | 'green' | 'red'
}

export interface CanvasConnection {
  id: string
  from: string
  to: string
  label: string
}

export const initialNodes: CanvasNode[] = [
  {
    id: 'n-note-1',
    kind: 'note',
    x: 60,
    y: 40,
    w: 210,
    h: 116,
    title: 'Working hypothesis',
    body: 'Initial access via spoofed credential-reset portal. Confirm endpoint compromise chain.',
    noteTone: 'amber',
  },
  {
    id: 'n-email-spoof',
    kind: 'entity',
    entityType: 'email',
    x: 90,
    y: 230,
    w: 220,
    h: 88,
    title: 'support@secure-eastgate-login.com',
    body: 'Spoofed sender',
    riskScore: 90,
  },
  {
    id: 'n-domain-spoof',
    kind: 'entity',
    entityType: 'domain',
    x: 410,
    y: 110,
    w: 220,
    h: 88,
    title: 'secure-eastgate-login.com',
    body: 'Phishing infrastructure',
    riskScore: 94,
  },
  {
    id: 'n-ip-1',
    kind: 'entity',
    entityType: 'ip',
    x: 410,
    y: 300,
    w: 220,
    h: 88,
    title: '185.233.81.14',
    body: 'Hosting — Sofia, BG',
    riskScore: 86,
  },
  {
    id: 'n-evidence-phish',
    kind: 'evidence',
    evidenceType: 'Email',
    x: 90,
    y: 400,
    w: 220,
    h: 92,
    title: 'Phishing_Email_March12.eml',
    body: 'Initial-access vector',
    confidence: 92,
  },
  {
    id: 'n-device',
    kind: 'entity',
    entityType: 'device',
    x: 740,
    y: 230,
    w: 220,
    h: 88,
    title: 'Employee Laptop — ETG-4471',
    body: 'Compromised endpoint',
    riskScore: 64,
  },
  {
    id: 'n-person-reed',
    kind: 'entity',
    entityType: 'person',
    x: 740,
    y: 410,
    w: 220,
    h: 88,
    title: 'Marcus Reed',
    body: 'Person of interest',
    riskScore: 88,
  },
  {
    id: 'n-org-horizon',
    kind: 'entity',
    entityType: 'organization',
    x: 1060,
    y: 300,
    w: 220,
    h: 88,
    title: 'Horizon Financial Group',
    body: 'Beneficiary account',
    riskScore: 73,
  },
  {
    id: 'n-wallet',
    kind: 'entity',
    entityType: 'wallet',
    x: 1060,
    y: 480,
    w: 220,
    h: 88,
    title: 'bc1q9x...k4t7',
    body: 'BTC wallet · 4.82 BTC',
    riskScore: 81,
  },
  {
    id: 'n-theory',
    kind: 'theory',
    x: 720,
    y: 560,
    w: 250,
    h: 150,
    title: 'Compromised employee account used for intrusion',
    confidence: 82,
  },
]

export const initialConnections: CanvasConnection[] = [
  { id: 'c1', from: 'n-email-spoof', to: 'n-domain-spoof', label: 'sent from' },
  { id: 'c2', from: 'n-domain-spoof', to: 'n-ip-1', label: 'hosted on' },
  { id: 'c3', from: 'n-evidence-phish', to: 'n-email-spoof', label: 'evidences' },
  { id: 'c4', from: 'n-domain-spoof', to: 'n-device', label: 'credentials harvested' },
  { id: 'c5', from: 'n-device', to: 'n-person-reed', label: 'accessed by' },
  { id: 'c6', from: 'n-person-reed', to: 'n-org-horizon', label: 'linked to' },
  { id: 'c7', from: 'n-org-horizon', to: 'n-wallet', label: 'layered to' },
]
