import { db } from '@/lib/db'

/** Whether the user is a member, viewer, or lead of the given case. */
export async function hasCaseAccess(caseId: string, userId: string): Promise<boolean> {
  const { rows } = await db.query(
    `SELECT 1 FROM case_members WHERE case_id = $1 AND user_id = $2
     UNION SELECT 1 FROM case_view_access WHERE case_id = $1 AND user_id = $2
     UNION SELECT 1 FROM investigation_cases WHERE id = $1 AND lead_id = $2`,
    [caseId, userId],
  )
  return rows.length > 0
}
