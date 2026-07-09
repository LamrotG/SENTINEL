/**
 * Builds a `SET col = $n, ...` UPDATE query from a partial patch object,
 * only touching columns present in `columnMap` (camelCase key -> db column).
 * Returns null if the patch has nothing matching columnMap (nothing to do).
 */
export function buildUpdateQuery(
  table: string,
  id: string,
  patch: Record<string, unknown>,
  columnMap: Record<string, string>,
  options: { touchUpdatedAt?: boolean } = {},
) {
  const sets: string[] = []
  const values: unknown[] = []
  let i = 1
  for (const [key, column] of Object.entries(columnMap)) {
    if (key in patch) {
      sets.push(`${column} = $${i}`)
      values.push(patch[key])
      i++
    }
  }
  if (sets.length === 0) return null
  if (options.touchUpdatedAt) sets.push('updated_at = now()')
  values.push(id)
  return {
    text: `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values,
  }
}
