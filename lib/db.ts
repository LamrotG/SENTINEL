import { Pool } from 'pg'

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
  query: (...args: Parameters<Pool['query']>) => getPool().query(...args),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
}
