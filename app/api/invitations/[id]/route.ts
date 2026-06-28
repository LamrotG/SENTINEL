import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: invitationId } = await params
    const { action } = await request.json()
    if (action !== 'accept' && action !== 'decline') {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { rows } = await db.query(
      `SELECT * FROM case_invitations WHERE id = $1 AND invitee_id = $2 AND status = 'pending'`,
      [invitationId, session.id]
    )
    if (rows.length === 0) return Response.json({ error: 'Invitation not found' }, { status: 404 })

    const invitation = rows[0]
    const newStatus = action === 'accept' ? 'accepted' : 'declined'

    await db.query(
      'UPDATE case_invitations SET status = $1, responded_at = now() WHERE id = $2',
      [newStatus, invitationId]
    )

    if (action === 'accept') {
      if (invitation.type === 'collaborator') {
        await db.query(
          `INSERT INTO case_members (case_id, user_id, role, permissions)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (case_id, user_id) DO UPDATE SET role = EXCLUDED.role, permissions = EXCLUDED.permissions`,
          [invitation.case_id, invitation.invitee_id, invitation.role ?? 'Investigator', invitation.permissions ?? []]
        )
      } else {
        await db.query(
          `INSERT INTO case_view_access (case_id, user_id, granted_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (case_id, user_id) DO NOTHING`,
          [invitation.case_id, invitation.invitee_id, invitation.inviter_id]
        )
      }
    }

    await db.query(
      `INSERT INTO notifications (user_id, type, title, body, case_id, actor_id, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        invitation.inviter_id,
        action === 'accept' ? 'invitation_accepted' : 'invitation_declined',
        `Invitation ${newStatus}`,
        `${session.fullName} ${newStatus} your ${invitation.type} invitation`,
        invitation.case_id,
        session.id,
        `/cases/${invitation.case_id}`,
      ]
    )

    return Response.json({ ok: true, status: newStatus })
  } catch (error) {
    console.error('Respond to invitation error:', error)
    return Response.json({ error: 'Failed to respond to invitation' }, { status: 500 })
  }
}
