/**
 * SQL string literal escaping for raw SQL fragments.
 *
 * Note:
 * - Prefer parameterized queries where possible.
 * - This is only used for a few SQLite raw fragments where Drizzle does not offer
 *   a convenient/typed API (e.g. FTS MATCH, relation ID lists).
 */
export function escapeSqlStringLiteral(value: string): string {
  return value.replace(/'/g, "''")
}
