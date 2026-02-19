import { markRaw, type Component } from 'vue'
import { createReactiveRegistry } from '@renderer/utils'

export interface SettingsDialogDefinition {
  id: string
  component: Component
}

export const settings = {
  plugins: {
    dialogs: createReactiveRegistry<SettingsDialogDefinition>({
      normalize: (definition) => ({ ...definition, component: markRaw(definition.component) })
    })
  }
} as const
