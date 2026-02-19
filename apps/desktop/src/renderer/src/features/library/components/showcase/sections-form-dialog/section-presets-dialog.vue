<!--
  LibraryShowcaseSectionPresetFormDialog - Preset selection dialog
  Dialog for selecting showcase section presets to add.
  Returns sections via @add callback (no DB operations).
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { SHOWCASE_SECTION_PRESETS, type ShowcaseSectionPreset } from './section-presets'
import type { AllEntityType } from '@shared/common'
import type { ShowcaseSectionFormItem } from '@shared/db'
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

// =============================================================================
// Constants
// =============================================================================

const ENTITY_TYPE_LABELS: Record<AllEntityType, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司',
  collection: '合集',
  tag: '标签'
}

// =============================================================================
// Props & Emits
// =============================================================================

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  add: [sections: ShowcaseSectionFormItem[]]
}>()

// =============================================================================
// State
// =============================================================================

const selectedIds = ref<Set<string>>(new Set())

// Group presets by entity type for organized display
const presetsByEntityType: Record<AllEntityType, ShowcaseSectionPreset[]> = (() => {
  const result = {} as Record<AllEntityType, ShowcaseSectionPreset[]>
  for (const preset of SHOWCASE_SECTION_PRESETS) {
    const type = preset.entityType
    if (!result[type]) result[type] = []
    result[type].push(preset)
  }
  return result
})()

// =============================================================================
// Handlers
// =============================================================================

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

  const sectionsToAdd: ShowcaseSectionFormItem[] = SHOWCASE_SECTION_PRESETS.filter((p) =>
    selectedIds.value.has(p.id)
  ).map((preset, index) => ({
    id: nanoid(),
    entityType: preset.entityType,
    name: preset.name,
    order: index,
    isVisible: true,
    layout: preset.layout,
    itemSize: preset.itemSize,
    openMode: 'page',
    limit: preset.limit,
    filter: preset.filter,
    sortField: preset.sortField,
    sortDirection: preset.sortDirection,
    isNew: true
  }))

  emit('add', sectionsToAdd)
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
        <DialogTitle>选择预设区块</DialogTitle>
      </DialogHeader>
      <DialogBody class="max-h-[60vh] overflow-auto scrollbar-thin">
        <template v-if="SHOWCASE_SECTION_PRESETS.length === 0">
          <p class="text-sm text-muted-foreground text-center py-8">暂无可用预设</p>
        </template>
        <template v-else>
          <div class="space-y-4">
            <div
              v-for="(presets, entityType) in presetsByEntityType"
              :key="entityType"
              class="space-y-1"
            >
              <div class="flex items-center text-xs font-medium text-muted-foreground px-1">
                {{ ENTITY_TYPE_LABELS[entityType] || entityType }}
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
                </div>
              </label>
            </div>
          </div>
        </template>
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
