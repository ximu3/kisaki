export interface ResolvedUpdateOptions<Field extends string> {
  fields: Field[]
  apply: 'always' | 'ifMissing'
  strategy: 'replace' | 'merge'
}
