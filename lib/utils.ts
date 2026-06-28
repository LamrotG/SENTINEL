import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDate(value: unknown): string {
  if (!value) return ''
  if (value instanceof Date) return value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const str = String(value)
  const d = new Date(str)
  return isNaN(d.getTime()) ? str : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
