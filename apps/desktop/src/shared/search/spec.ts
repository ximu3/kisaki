export type SearchQuerySpec =
  | { kind: 'fts'; ftsTable: string; sourceTable: string }
  | { kind: 'like'; columns: readonly any[] }
