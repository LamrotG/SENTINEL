import { cookies } from 'next/headers'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { buildSessionCookie } from '@/lib/auth'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const { rows } = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [userId]
    )

    const user = rows[0]

    if (!user || user.password_hash !== hashPassword(password)) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const session = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      department: user.department,
      position: user.position,
      iat: Date.now(),
    }

    const store = await cookies()
    store.set(buildSessionCookie(session))

    return Response.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        department: user.department,
        position: user.position,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
