import type { Ref } from 'vue'
import { createContext } from 'reka-ui'

export { default as Command } from './command.vue'
export { default as CommandDialog } from './command-dialog.vue'
export { default as CommandEmpty } from './command-empty.vue'
export { default as CommandGroup } from './command-group.vue'
export { default as CommandInput } from './command-input.vue'
export { default as CommandItem } from './command-item.vue'
export { default as CommandList } from './command-list.vue'
export { default as CommandSeparator } from './command-separator.vue'
export { default as CommandShortcut } from './command-shortcut.vue'

export const [useCommand, provideCommandContext] = createContext<{
  allItems: Ref<Map<string, string>>
  allGroups: Ref<Map<string, Set<string>>>
  filterState: {
    search: string
    filtered: { count: number; items: Map<string, number>; groups: Set<string> }
  }
}>('Command')

export const [useCommandGroup, provideCommandGroupContext] = createContext<{
  id?: string
}>('CommandGroup')
