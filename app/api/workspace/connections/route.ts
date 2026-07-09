import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'

function nextConnectionId() {
  return `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
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

    const { rows } = await db.query('SELECT * FROM workspace_connections WHERE case_id = $1 ORDER BY created_at ASC', [caseId])
    return Response.json(rows)
  } catch (error) {
    console.error('Workspace connections list error:', error)
    return Response.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { caseId, fromNodeId, toNodeId, label } = body
    if (!caseId || !fromNodeId || !toNodeId) {
      return Response.json({ error: 'Missing caseId, fromNodeId, or toNodeId' }, { status: 400 })
    }
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const id = nextConnectionId()
    const { rows } = await db.query(
      `INSERT INTO workspace_connections (id, case_id, from_node_id, to_node_id, label)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, caseId, fromNodeId, toNodeId, label ?? 'related to'],
    )
    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create workspace connection error:', error)
    return Response.json({ error: 'Failed to create connection' }, { status: 500 })
  }
}
