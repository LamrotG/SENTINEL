import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE = 'sentinel_session'
const SECRET = process.env.SESSION_SECRET || 'sentinel-default-secret-change-me'

export function signToken(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  if (sig !== expected) return null
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}

export async function getSession(): Promise<Record<string, unknown> | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function buildSessionCookie(payload: Record<string, unknown>) {
  const token = signToken(payload)
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
}

export { SESSION_COOKIE }
