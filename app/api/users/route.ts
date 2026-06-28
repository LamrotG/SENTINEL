import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (q) {
      const { rows } = await db.query(
        `SELECT id, username, full_name, department, position, joined_year
         FROM users
         WHERE username ILIKE $1 OR full_name ILIKE $1
         ORDER BY full_name ASC
         LIMIT 20`,
        [`%${q}%`]
      )
      return Response.json(rows)
    }

    const { rows } = await db.query(
      `SELECT id, username, full_name, department, position, joined_year
       FROM users ORDER BY full_name ASC`
    )
    return Response.json(rows)
  } catch (error) {
    console.error('Users query error:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
