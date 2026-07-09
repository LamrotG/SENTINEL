import crypto from 'crypto'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { hasCaseAccess } from '@/lib/case-access'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: caseId } = await params
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const { rows } = await db.query(
      `SELECT * FROM case_presentation_links WHERE case_id = $1 AND revoked = false ORDER BY created_at DESC LIMIT 1`,
      [caseId],
    )
    return Response.json(rows[0] ?? null)
  } catch (error) {
    console.error('Get presentation link error:', error)
    return Response.json({ error: 'Failed to fetch presentation link' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: caseId } = await params
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const { rows: existing } = await db.query(
      `SELECT * FROM case_presentation_links WHERE case_id = $1 AND revoked = false ORDER BY created_at DESC LIMIT 1`,
      [caseId],
    )
    if (existing.length > 0) return Response.json(existing[0])

    const token = crypto.randomBytes(24).toString('base64url')
    const { rows } = await db.query(
      `INSERT INTO case_presentation_links (case_id, token, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [caseId, token, session.id],
    )
    return Response.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Create presentation link error:', error)
    return Response.json({ error: 'Failed to create presentation link' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 })

    const { id: caseId } = await params
    if (!(await hasCaseAccess(caseId, session.id as string))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.query(`UPDATE case_presentation_links SET revoked = true WHERE case_id = $1 AND revoked = false`, [caseId])
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Revoke presentation link error:', error)
    return Response.json({ error: 'Failed to revoke presentation link' }, { status: 500 })
  }
}
