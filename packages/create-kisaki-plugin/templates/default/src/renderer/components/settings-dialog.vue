<script setup lang="ts">
/**
 * Demo Plugin - Settings Dialog
 *
 * Complete settings dialog with custom header, body, and footer.
 * Uses SDK UI components for consistent styling.
 */

import { ref, watch } from '@kisaki/plugin-sdk/renderer/vue'
import { db, schema, events, notify } from '@kisaki/plugin-sdk/renderer'
import { useAsyncData, useEvent } from '@kisaki/plugin-sdk/renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  Button,
  Input,
  Switch,
  Spinner
} from '@kisaki/plugin-sdk/renderer/ui'
import { eq, and } from '@kisaki/plugin-sdk/renderer/drizzle'
import { PLUGIN_ID } from '../../shared/manifest'

interface PluginSettings {
  enableFeature: boolean
  maxItems: number
}

const DEFAULT_SETTINGS: PluginSettings = {
  enableFeature: true,
  maxItems: 10
}

const open = defineModel<boolean>('open', { required: true })

// Fetch settings from pluginData table
async function fetchSettings(): Promise<PluginSettings> {
  const result = await db
    .select()
    .from(schema.pluginData)
    .where(and(eq(schema.pluginData.pluginId, PLUGIN_ID), eq(schema.pluginData.key, 'settings')))
    .limit(1)

  if (result.length > 0 && result[0].value) {
    return { ...DEFAULT_SETTINGS, ...(result[0].value as Partial<PluginSettings>) }
  }
  return { ...DEFAULT_SETTINGS }
}

const { data: settings, isLoading, refetch } = useAsyncData(fetchSettings)

// Local form state
const enableFeature = ref(DEFAULT_SETTINGS.enableFeature)
const maxItems = ref(DEFAULT_SETTINGS.maxItems)

watch(
  settings,
  (s) => {
    if (s) {
      enableFeature.value = s.enableFeature
      maxItems.value = s.maxItems
    }
  },
  { immediate: true }
)

// Listen for external updates
useEvent('db:updated', ({ table }) => {
  if (table === 'plugin_data') refetch()
})

const isSaving = ref(false)

async function save() {
  isSaving.value = true
  try {
    const newSettings: PluginSettings = {
      enableFeature: enableFeature.value,
      maxItems: maxItems.value
    }

    await db
      .insert(schema.pluginData)
      .values({ pluginId: PLUGIN_ID, key: 'settings', value: newSettings })
      .onConflictDoUpdate({
        target: [schema.pluginData.pluginId, schema.pluginData.key],
        set: { value: newSettings }
      })

    events.emit('db:updated', { table: 'plugin_data', id: PLUGIN_ID })
    notify.success('Settings saved!')
    await refetch()
    open.value = false
  } catch (err) {
    notify.error('Failed to save settings')
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

function cancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Demo Plugin Settings</DialogTitle>
        <DialogDescription class="sr-only">Configure Demo Plugin settings</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-8"
        >
          <Spinner class="size-6" />
        </div>

        <FieldGroup
          v-else
          class="py-4"
        >
          <!-- Toggle Field -->
          <Field orientation="horizontal">
            <FieldLabel>Enable Feature</FieldLabel>
            <FieldDescription>Toggle to enable or disable the main feature</FieldDescription>
            <FieldContent>
              <Switch v-model="enableFeature" />
            </FieldContent>
          </Field>

          <!-- Number Input Field -->
          <Field>
            <FieldLabel>Max Items</FieldLabel>
            <FieldDescription>Maximum number of items to display (1-100)</FieldDescription>
            <FieldContent>
              <Input
                v-model="maxItems"
                type="number"
                :min="1"
                :max="100"
              />
            </FieldContent>
          </Field>
        </FieldGroup>
      </DialogBody>

      <!-- Custom Footer -->
      <DialogFooter>
        <Button
          variant="ghost"
          @click="cancel"
        >
          Cancel
        </Button>
        <Button
          :disabled="isSaving || isLoading"
          @click="save"
        >
          <Spinner
            v-if="isSaving"
            class="size-4 mr-2"
          />
          {{ isSaving ? 'Saving...' : 'Save' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
