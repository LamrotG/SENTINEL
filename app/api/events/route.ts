import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'

function nextEventId() {
  return `EVT-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
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
      'SELECT * FROM events WHERE case_id = $1 ORDER BY occurred_at ASC',
      [caseId],
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Events list error:', error)
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { caseId, title, description, eventType, occurredAt, location, tags, notes, entityIds, evidenceIds } = body
    if (!caseId) return Response.json({ error: 'Missing caseId' }, { status: 400 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const id = nextEventId()
    const { rows } = await db.query(
      `INSERT INTO events (id, title, description, case_id, entity_ids, evidence_ids, event_type, occurred_at, location, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        title || 'Untitled event',
        description ?? '',
        caseId,
        entityIds ?? [],
        evidenceIds ?? [],
        eventType ?? 'other',
        occurredAt ?? new Date().toISOString(),
        location ?? '',
        tags ?? [],
        notes ?? '',
      ],
    )
    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return Response.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
