import {
  Activity,
  ArrowLeftRight,
  Handshake,
  KeyRound,
  Mail,
  Phone,
  Radio,
  Server,
  Siren,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface EventTypeMeta {
  icon: LucideIcon
  color: string
  label: string
}

export const EVENT_TYPE_META: Record<string, EventTypeMeta> = {
  access: { icon: KeyRound, color: 'text-warning', label: 'Access' },
  communication: { icon: Radio, color: 'text-info', label: 'Communication' },
  transaction: { icon: ArrowLeftRight, color: 'text-danger', label: 'Transaction' },
  system: { icon: Server, color: 'text-muted-foreground', label: 'System' },
  detection: { icon: Activity, color: 'text-confidence', label: 'Detection' },
  email: { icon: Mail, color: 'text-info', label: 'Email Sent' },
  call: { icon: Phone, color: 'text-info', label: 'Phone Call' },
  meeting: { icon: Users, color: 'text-info', label: 'Meeting' },
  interview: { icon: Phone, color: 'text-warning', label: 'Interview' },
  warrant: { icon: Siren, color: 'text-danger', label: 'Search Warrant' },
  arrest: { icon: Handshake, color: 'text-danger', label: 'Arrest' },
  other: { icon: Activity, color: 'text-muted-foreground', label: 'Other' },
}

export const EVENT_TYPE_OPTIONS = Object.keys(EVENT_TYPE_META)

export function getEventTypeMeta(type: string | undefined | null): EventTypeMeta {
  return (type && EVENT_TYPE_META[type]) || EVENT_TYPE_META.other
}
