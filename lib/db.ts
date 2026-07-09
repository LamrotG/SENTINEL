import { Pool, type QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable')
    }
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  }
  return pool
}

export const db = {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> =>
    getPool().query<T>(text, params),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
}
