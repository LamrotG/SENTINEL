import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const userId = session.id as string

    const { rows } = await db.query(
      `SELECT DISTINCT c.*, u.full_name AS lead_name, u.username AS lead_username,
              cm.role AS my_role
       FROM investigation_cases c
       JOIN users u ON u.id = c.lead_id
       LEFT JOIN case_members cm ON cm.case_id = c.id AND cm.user_id = $1
       LEFT JOIN case_view_access va ON va.case_id = c.id AND va.user_id = $1
       WHERE c.lead_id = $1
          OR cm.user_id = $1
          OR va.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    )
    return Response.json(rows)
  } catch (error) {
    console.error('DB GET error:', error)
    return Response.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { id, title, category, status, priority, summary } = body
    const leadId = session.id as string

    const { rows } = await db.query(
      `INSERT INTO investigation_cases (id, title, category, status, priority, lead_id, summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, title, category, status, priority, leadId, summary]
    )

    const caseRow = rows[0]

    await db.query(
      `INSERT INTO case_members (case_id, user_id, role, permissions)
       VALUES ($1, $2, 'Lead Investigator', $3)`,
      [caseRow.id, leadId, [
        'view_case','edit_case','add_evidence','edit_evidence','delete_evidence',
        'manage_entities','manage_timeline','generate_reports','invite_members','manage_settings',
      ]]
    )

    return Response.json(caseRow, { status: 201 })
  } catch (error) {
    console.error('DB INSERT error:', error)
    return Response.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
