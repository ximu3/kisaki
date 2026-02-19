import { markRaw, type Component } from 'vue'
import { createReactiveRegistry } from '@renderer/utils'

export interface DetailTabDefinition {
  id: string
  label: string
  icon?: string
  order?: number
  component: Component
}

function sortByOrder(a: { order?: number }, b: { order?: number }) {
  return (a.order ?? 100) - (b.order ?? 100)
}

function createDetailTabsRegistry() {
  return createReactiveRegistry<DetailTabDefinition>({
    normalize: (definition) => ({ ...definition, component: markRaw(definition.component) }),
    sort: sortByOrder
  })
}

export const detailTabs = {
  game: createDetailTabsRegistry(),
  character: createDetailTabsRegistry(),
  person: createDetailTabsRegistry(),
  company: createDetailTabsRegistry(),
  collection: createDetailTabsRegistry()
} as const
