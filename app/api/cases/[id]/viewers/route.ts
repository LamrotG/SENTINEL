import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { rows } = await db.query(
      `SELECT va.*, u.full_name, u.username, u.department
       FROM case_view_access va
       JOIN users u ON u.id = va.user_id
       WHERE va.case_id = $1
       ORDER BY va.created_at DESC`,
      [caseId]
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Viewers error:', error)
    return Response.json({ error: 'Failed to fetch viewers' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { accessId } = await request.json()
    await db.query('DELETE FROM case_view_access WHERE id = $1', [accessId])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Remove viewer error:', error)
    return Response.json({ error: 'Failed to remove viewer' }, { status: 500 })
  }
}
