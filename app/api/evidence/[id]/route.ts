import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'
import { buildUpdateQuery } from '@/lib/build-update'

const COLUMN_MAP: Record<string, string> = {
  name: 'name',
  type: 'type',
  source: 'source',
  size: 'size',
  tags: 'tags',
  confidence: 'confidence',
  summary: 'summary',
  linkedEntityIds: 'linked_entity_ids',
}

async function loadCaseId(id: string): Promise<string | null> {
  const { rows } = await db.query('SELECT case_id FROM evidence WHERE id = $1', [id])
  return rows[0]?.case_id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Evidence not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const patch = await request.json()
    const query = buildUpdateQuery('evidence', id, patch, COLUMN_MAP)
    if (!query) return Response.json({ error: 'No valid fields to update' }, { status: 400 })

    const { rows } = await db.query(query.text, query.values)
    return Response.json(rows[0])
  } catch (error) {
    console.error('Update evidence error:', error)
    return Response.json({ error: 'Failed to update evidence' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Evidence not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.query('DELETE FROM evidence WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Delete evidence error:', error)
    return Response.json({ error: 'Failed to delete evidence' }, { status: 500 })
  }
}
