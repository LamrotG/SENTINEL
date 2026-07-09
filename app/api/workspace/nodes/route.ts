import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'

function nextNodeId(kind: string) {
  return `${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
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

    const { rows } = await db.query('SELECT * FROM workspace_nodes WHERE case_id = $1 ORDER BY created_at ASC', [caseId])
    return Response.json(rows)
  } catch (error) {
    console.error('Workspace nodes list error:', error)
    return Response.json({ error: 'Failed to fetch nodes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { caseId, kind, x, y, w, h, title, bodyText, entityType, evidenceType, confidence, riskScore, noteTone } = body
    if (!caseId || !kind) return Response.json({ error: 'Missing caseId or kind' }, { status: 400 })
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const id = nextNodeId(kind)
    const { rows } = await db.query(
      `INSERT INTO workspace_nodes (id, case_id, kind, x, y, w, h, title, body, entity_type, evidence_type, confidence, risk_score, note_tone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        id, caseId, kind,
        x ?? 0, y ?? 0, w ?? 220, h ?? 96,
        title ?? '', bodyText ?? null,
        entityType ?? null, evidenceType ?? null,
        confidence ?? null, riskScore ?? null, noteTone ?? null,
      ],
    )
    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create workspace node error:', error)
    return Response.json({ error: 'Failed to create node' }, { status: 500 })
  }
}
