import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { rows } = await db.query(
      `SELECT n.*, u.full_name AS actor_name, u.username AS actor_username
       FROM notifications n
       LEFT JOIN users u ON u.id = n.actor_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [session.id]
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Notifications error:', error)
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id, action } = await request.json()

    if (action === 'read') {
      await db.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
        [id, session.id]
      )
    } else if (action === 'read_all') {
      await db.query(
        'UPDATE notifications SET read = true WHERE user_id = $1',
        [session.id]
      )
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Update notification error:', error)
    return Response.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
