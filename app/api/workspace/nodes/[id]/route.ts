import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'
import { buildUpdateQuery } from '@/lib/build-update'

const COLUMN_MAP: Record<string, string> = {
  x: 'x',
  y: 'y',
  w: 'w',
  h: 'h',
  title: 'title',
  bodyText: 'body',
  entityType: 'entity_type',
  evidenceType: 'evidence_type',
  confidence: 'confidence',
  riskScore: 'risk_score',
  noteTone: 'note_tone',
}

async function loadCaseId(id: string): Promise<string | null> {
  const { rows } = await db.query('SELECT case_id FROM workspace_nodes WHERE id = $1', [id])
  return rows[0]?.case_id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Node not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const patch = await request.json()
    const query = buildUpdateQuery('workspace_nodes', id, patch, COLUMN_MAP, { touchUpdatedAt: true })
    if (!query) return Response.json({ error: 'No valid fields to update' }, { status: 400 })

    const { rows } = await db.query(query.text, query.values)
    return Response.json(rows[0])
  } catch (error) {
    console.error('Update workspace node error:', error)
    return Response.json({ error: 'Failed to update node' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id } = await params
    const caseId = await loadCaseId(id)
    if (!caseId) return Response.json({ error: 'Node not found' }, { status: 404 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.query('DELETE FROM workspace_nodes WHERE id = $1', [id])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Delete workspace node error:', error)
    return Response.json({ error: 'Failed to delete node' }, { status: 500 })
  }
}
