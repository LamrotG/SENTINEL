import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { rows } = await db.query(
      `SELECT ci.*,
              inv.full_name AS inviter_name, inv.username AS inviter_username,
              ive.full_name AS invitee_name, ive.username AS invitee_username
       FROM case_invitations ci
       JOIN users inv ON inv.id = ci.inviter_id
       JOIN users ive ON ive.id = ci.invitee_id
       WHERE ci.case_id = $1
       ORDER BY ci.created_at DESC`,
      [caseId]
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Invitations error:', error)
    return Response.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: caseId } = await params
    const { username, type, role, permissions } = await request.json()

    const { rows: userRows } = await db.query('SELECT id, full_name FROM users WHERE username = $1', [username])
    if (userRows.length === 0) return Response.json({ error: 'User not found' }, { status: 404 })
    const invitee = userRows[0]

    const { rows: existing } = await db.query(
      `SELECT id FROM case_invitations WHERE case_id = $1 AND invitee_id = $2 AND status = 'pending'`,
      [caseId, invitee.id]
    )
    if (existing.length > 0) return Response.json({ error: 'Invitation already pending' }, { status: 409 })

    const { rows: memberCheck } = await db.query(
      'SELECT id FROM case_members WHERE case_id = $1 AND user_id = $2',
      [caseId, invitee.id]
    )
    if (memberCheck.length > 0) return Response.json({ error: 'User is already a member' }, { status: 409 })

    const { rows } = await db.query(
      `INSERT INTO case_invitations (case_id, inviter_id, invitee_id, type, role, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [caseId, session.id, invitee.id, type, role ?? null, permissions ?? []]
    )

    const { rows: caseRows } = await db.query('SELECT title FROM investigation_cases WHERE id = $1', [caseId])
    const caseTitle = caseRows[0]?.title ?? caseId

    const notifTitle = type === 'viewer'
      ? 'View-only access invitation'
      : `Collaboration invitation — ${role ?? 'Investigator'}`

    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, case_id, actor_id, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        invitee.id,
        type === 'viewer' ? 'view_invitation' : 'collab_invitation',
        notifTitle,
        `${session.fullName} invited you to "${caseTitle}"`,
        caseId,
        session.id,
        `/cases/${caseId}`,
      ]
    )

    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create invitation error:', error)
    return Response.json({ error: 'Failed to create invitation' }, { status: 500 })
  }
}
