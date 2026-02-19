import { createReactiveRegistry } from '@renderer/utils'

export interface SidebarNavDefinition {
  id: string
  label: string
  icon?: string
  path: string
  order?: number
}

function sortByOrder(a: { order?: number }, b: { order?: number }) {
  return (a.order ?? 100) - (b.order ?? 100)
}

export const sidebar = {
  nav: createReactiveRegistry<SidebarNavDefinition>({ sort: sortByOrder })
} as const
