import { db } from '@/lib/db'
import { cases, entities, evidence, theories, timelineEvents } from '@/lib/data'

// Public, unauthenticated endpoint — backs the /present/[token] view-only
// presentation link. Must never expose more than the read-only presentation
// payload (no workspace/evidence-vault/timeline/report/case-management data).
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const { rows } = await db.query(
      'SELECT case_id, revoked FROM case_presentation_links WHERE token = $1',
      [token],
    )
    if (rows.length === 0 || rows[0].revoked) {
      return Response.json({ error: 'This link is invalid or has been revoked' }, { status: 404 })
    }

    const activeCase = cases.find((c) => c.id === rows[0].case_id)
    if (!activeCase) return Response.json({ error: 'Case not found' }, { status: 404 })

    return Response.json({
      case: activeCase,
      entities: entities.filter((e) => activeCase.entityIds.includes(e.id)),
      evidence: evidence.filter((e) => activeCase.evidenceIds.includes(e.id)),
      timeline: timelineEvents.filter((t) => t.caseId === activeCase.id),
      theories: theories.filter((t) => t.caseId === activeCase.id),
    })
  } catch (error) {
    console.error('Public presentation error:', error)
    return Response.json({ error: 'Failed to load presentation' }, { status: 500 })
  }
}
