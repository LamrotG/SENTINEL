import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { rows } = await db.query(
      `SELECT cm.*, u.full_name, u.username, u.department, u.position
       FROM case_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.case_id = $1
       ORDER BY cm.joined_at ASC`,
      [caseId]
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Members error:', error)
    return Response.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { memberId } = await request.json()
    await db.query('DELETE FROM case_members WHERE id = $1', [memberId])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return Response.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
