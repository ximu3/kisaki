import { detailTabs } from './detail-tabs'
import { menus } from './menus'
import { sidebar } from './sidebar'
import { settings } from './settings'

export { detailTabs } from './detail-tabs'
export type { DetailTabDefinition } from './detail-tabs'

export { menus } from './menus'
export type {
  MenuActionDefinition,
  GameMenuActionContext,
  GameBatchMenuActionContext,
  CharacterMenuActionContext,
  PersonMenuActionContext,
  CompanyMenuActionContext,
  CollectionMenuActionContext,
  TagMenuActionContext
} from './menus'

export { sidebar } from './sidebar'
export type { SidebarNavDefinition } from './sidebar'

export { settings } from './settings'
export type { SettingsDialogDefinition } from './settings'

export type { ReactiveRegistry } from '@renderer/utils'

export type UiExtensions = typeof uiExtensions

export const uiExtensions = {
  detailTabs,
  menus,
  sidebar,
  settings
} as const
