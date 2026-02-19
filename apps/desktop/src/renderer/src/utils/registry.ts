import { ref, type Ref } from 'vue'

export interface ReactiveRegistry<TDefinition extends { id: string }> {
  readonly items: Ref<TDefinition[]>
  register(definition: TDefinition): () => void
  unregister(id: string): boolean
  has(id: string): boolean
  get(id: string): TDefinition | undefined
}

export function createReactiveRegistry<TDefinition extends { id: string }>(options?: {
  normalize?: (definition: TDefinition) => TDefinition
  sort?: (a: TDefinition, b: TDefinition) => number
}): ReactiveRegistry<TDefinition> {
  const registrations = new Map<string, TDefinition>()
  const items: Ref<TDefinition[]> = ref([])

  function sync() {
    const values = [...registrations.values()]
    if (options?.sort) values.sort(options.sort)
    items.value = values
  }

  function unregister(id: string): boolean {
    const existed = registrations.delete(id)
    if (!existed) return false
    sync()
    return true
  }

  return {
    items,
    unregister,
    has(id: string) {
      return registrations.has(id)
    },
    get(id: string) {
      return registrations.get(id)
    },
    register(definition: TDefinition): () => void {
      if (registrations.has(definition.id)) {
        throw new Error(`Already registered: ${definition.id}`)
      }

      const normalized = options?.normalize ? options.normalize(definition) : definition
      registrations.set(definition.id, normalized)
      sync()

      return () => {
        unregister(definition.id)
      }
    }
  }
}
