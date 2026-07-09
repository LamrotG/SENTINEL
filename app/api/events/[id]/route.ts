import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'
import { buildUpdateQuery } from '@/lib/build-update'

const COLUMN_MAP: Record<string, string> = {
  title: 'title',
  description: 'description',
  eventType: 'event_type',
  occurredAt: 'occurred_at',
  location: 'location',
  tags: 'tags',
  notes: 'notes',
  entityIds: 'entity_ids',
  evidenceIds: 'evidence_ids',
}

async function loadCaseId(id: string): Promise<string | null> {
  const { rows } = await db.query('SELECT case_id FROM events WHERE id = $1', [id])
  return rows[0]?.case_id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Event not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const patch = await request.json()
    const query = buildUpdateQuery('events', id, patch, COLUMN_MAP, { touchUpdatedAt: true })
    if (!query) return Response.json({ error: 'No valid fields to update' }, { status: 400 })

    const { rows } = await db.query(query.text, query.values)
    return Response.json(rows[0])
  } catch (error) {
    console.error('Update event error:', error)
    return Response.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Event not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.query('DELETE FROM events WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return Response.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
