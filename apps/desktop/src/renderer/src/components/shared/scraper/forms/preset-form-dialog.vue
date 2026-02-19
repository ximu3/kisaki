<!--
  ScraperPresetFormDialog
  Dialog for selecting presets to add as profiles.
  Follows name-extraction-preset-dialog pattern:
  - Returns profiles via onAdd callback (no DB operations)
  - Checkbox multi-select
-->
<script setup lang="ts">
import type { ScraperProfile } from '@shared/db'
import type { ContentEntityType } from '@shared/common'

import { ref, watch, computed } from 'vue'
import { nanoid } from 'nanoid'
import { SCRAPER_PRESETS, type ScraperPreset } from './presets'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'

interface Props {
  onAdd: (profiles: ScraperProfile[]) => void
  /** Optional filter: show presets for a single entity type */
  mediaType?: ContentEntityType
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const selectedIds = ref<Set<string>>(new Set())

const MEDIA_TYPE_LABELS: Record<ContentEntityType, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司'
}

const filteredPresets = computed(() => {
  if (!props.mediaType) return SCRAPER_PRESETS
  return SCRAPER_PRESETS.filter((p) => p.mediaType === props.mediaType)
})

// Group presets by media type for organized display (when no filter is provided)
const presetsByMediaType = computed(() => {
  if (props.mediaType) {
    return {
      [props.mediaType]: filteredPresets.value
    } as Record<ContentEntityType, ScraperPreset[]>
  }

  return SCRAPER_PRESETS.reduce<Record<ContentEntityType, ScraperPreset[]>>(
    (acc, preset) => {
      const type = preset.mediaType
      if (!acc[type]) acc[type] = []
      acc[type].push(preset)
      return acc
    },
    {} as Record<ContentEntityType, ScraperPreset[]>
  )
})

// Reset selection when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      selectedIds.value = new Set()
    }
  },
  { immediate: true }
)

function handleToggle(presetId: string) {
  const next = new Set(selectedIds.value)
  if (next.has(presetId)) {
    next.delete(presetId)
  } else {
    next.add(presetId)
  }
  selectedIds.value = next
}

// Helper to create checked model for preset selection
function createSelectedModel(presetId: string) {
  return computed({
    get: () => selectedIds.value.has(presetId),
    set: () => handleToggle(presetId)
  })
}

function handleAdd() {
  if (selectedIds.value.size === 0) return

  const profilesToAdd: ScraperProfile[] = filteredPresets.value.filter((p) =>
    selectedIds.value.has(p.id)
  ).map((preset, index) => ({
    id: nanoid(),
    name: preset.name,
    description: preset.description,
    mediaType: preset.mediaType,
    sourcePresetId: preset.id,
    searchProviderId: preset.searchProviderId,
    defaultLocale: preset.defaultLocale || null,
    slotConfigs: preset.slotConfigs,
    order: index,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  props.onAdd(profilesToAdd)
  selectedIds.value = new Set()
  open.value = false
}

function handleCancel() {
  selectedIds.value = new Set()
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>
          选择预设配置
          <span
            v-if="props.mediaType"
            class="text-muted-foreground text-xs font-normal"
          >
            （{{ MEDIA_TYPE_LABELS[props.mediaType] || props.mediaType }}）
          </span>
        </DialogTitle>
      </DialogHeader>
      <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
        <p
          v-if="filteredPresets.length === 0"
          class="text-sm text-muted-foreground text-center py-8"
        >
          暂无可用预设
        </p>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="[mediaTypeKey, presets] in Object.entries(presetsByMediaType)"
            :key="mediaTypeKey"
            class="space-y-1"
          >
            <div
              v-if="!props.mediaType"
              class="text-xs font-medium text-muted-foreground px-1"
            >
              {{ MEDIA_TYPE_LABELS[mediaTypeKey as ContentEntityType] || mediaTypeKey }}
            </div>
            <label
              v-for="preset in presets"
              :key="preset.id"
              class="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 cursor-pointer"
            >
              <Checkbox
                v-model="createSelectedModel(preset.id).value"
                class="mt-0.5"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium">{{ preset.name }}</div>
                <div class="text-xs text-muted-foreground">{{ preset.description }}</div>
                <div class="text-xs text-muted-foreground font-mono mt-1">
                  搜索: {{ preset.searchProviderId }}
                </div>
              </div>
            </label>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outline"
          @click="handleCancel"
        >
          取消
        </Button>
        <Button
          :disabled="selectedIds.size === 0"
          @click="handleAdd"
        >
          添加 ({{ selectedIds.size }})
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
