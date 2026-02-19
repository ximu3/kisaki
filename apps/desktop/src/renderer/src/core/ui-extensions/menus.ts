import { createReactiveRegistry } from '@renderer/utils'

export interface MenuActionDefinition<TContext> {
  id: string
  label: string
  icon?: string
  order?: number
  action: (context: TContext) => void | Promise<void>
  when?: (context: TContext) => boolean
}

export interface GameMenuActionContext {
  gameId: string
}

export interface GameBatchMenuActionContext {
  gameIds: string[]
}

export interface CharacterMenuActionContext {
  characterId: string
}

export interface PersonMenuActionContext {
  personId: string
}

export interface CompanyMenuActionContext {
  companyId: string
}

export interface CollectionMenuActionContext {
  collectionId: string
}

export interface TagMenuActionContext {
  tagId: string
}

function sortByOrder(a: { order?: number }, b: { order?: number }) {
  return (a.order ?? 100) - (b.order ?? 100)
}

function createMenuRegistry<TContext>() {
  return createReactiveRegistry<MenuActionDefinition<TContext>>({ sort: sortByOrder })
}

export const menus = {
  game: {
    single: createMenuRegistry<GameMenuActionContext>(),
    batch: createMenuRegistry<GameBatchMenuActionContext>()
  },
  character: {
    single: createMenuRegistry<CharacterMenuActionContext>()
  },
  person: {
    single: createMenuRegistry<PersonMenuActionContext>()
  },
  company: {
    single: createMenuRegistry<CompanyMenuActionContext>()
  },
  collection: {
    single: createMenuRegistry<CollectionMenuActionContext>()
  },
  tag: {
    single: createMenuRegistry<TagMenuActionContext>()
  }
} as const
