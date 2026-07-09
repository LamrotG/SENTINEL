import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'

function nextEvidenceId() {
  return `EVD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const caseId = new URL(request.url).searchParams.get('caseId')
    if (!caseId) return Response.json({ error: 'Missing caseId' }, { status: 400 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const { rows } = await db.query(
      'SELECT * FROM evidence WHERE case_id = $1 ORDER BY added_at DESC NULLS LAST',
      [caseId],
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Evidence list error:', error)
    return Response.json({ error: 'Failed to fetch evidence' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { caseId, name, type, source, size, tags, confidence, summary, linkedEntityIds } = body
    if (!caseId) return Response.json({ error: 'Missing caseId' }, { status: 400 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const id = nextEvidenceId()
    const { rows } = await db.query(
      `INSERT INTO evidence (id, name, type, source, added_at, size, tags, confidence, case_id, linked_entity_ids, summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        name || 'Untitled evidence',
        type ?? 'PDF',
        source ?? '',
        new Date().toISOString().slice(0, 10),
        size ?? '—',
        tags ?? [],
        confidence ?? 0,
        caseId,
        linkedEntityIds ?? [],
        summary ?? '',
      ],
    )
    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create evidence error:', error)
    return Response.json({ error: 'Failed to create evidence' }, { status: 500 })
  }
}
