import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const userId = session.id as string
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    const { rows: caseRows } = await db.query(
      `SELECT c.*, u.full_name AS lead_name, u.username AS lead_username
       FROM investigation_cases c
       JOIN users u ON u.id = c.lead_id
       WHERE c.id = $1`,
      [id]
    )
    if (caseRows.length === 0) return Response.json({ error: 'Case not found' }, { status: 404 })

    const { rows: accessCheck } = await db.query(
      `SELECT 1 FROM case_members WHERE case_id = $1 AND user_id = $2
       UNION SELECT 1 FROM case_view_access WHERE case_id = $1 AND user_id = $2
       UNION SELECT 1 FROM investigation_cases WHERE id = $1 AND lead_id = $2`,
      [id, userId]
    )
    if (accessCheck.length === 0) return Response.json({ error: 'Access denied' }, { status: 403 })

    const { rows: members } = await db.query(
      `SELECT cm.*, u.full_name, u.username, u.department, u.position
       FROM case_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.case_id = $1
       ORDER BY cm.joined_at ASC`,
      [id]
    )

    const { rows: entityRows } = await db.query(
      `SELECT e.* FROM entities e
       INNER JOIN case_entities ce ON ce.entity_id = e.id
       WHERE ce.case_id = $1`,
      [id]
    )

    const { rows: evidenceRows } = await db.query(
      'SELECT * FROM evidence WHERE case_id = $1',
      [id]
    )

    const { rows: timelineRows } = await db.query(
      'SELECT * FROM timeline_events WHERE case_id = $1 ORDER BY timestamp ASC',
      [id]
    )

    return Response.json({
      case: caseRows[0],
      members,
      entities: entityRows,
      evidence: evidenceRows,
      timeline: timelineRows,
    })
  } catch (error) {
    console.error('Hydration error:', error)
    return Response.json({ error: 'Failed to hydrate case' }, { status: 500 })
  }
}
