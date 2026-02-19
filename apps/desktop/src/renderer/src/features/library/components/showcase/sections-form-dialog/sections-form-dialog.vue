<!--
  LibraryShowcaseSectionsFormDialog - Manage all showcase sections
  List view with order adjustment controls.
  Inline section form dialog for add/edit.
  Save all changes at once.
-->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { asc, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@renderer/core/db'
import { showcaseSections } from '@shared/db'
import { useAsyncData, useRenderState } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import LibraryShowcaseSectionsItem from './section-item.vue'
import LibraryShowcaseSectionItemFormDialog from './section-item-form-dialog.vue'
import LibraryShowcaseSectionPresetsDialog from './section-presets-dialog.vue'
import { notify } from '@renderer/core/notify'
import type {
  ShowcaseSectionFormItem,
  SectionLayout,
  SectionItemSize,
  SectionOpenMode,
  SortDirection
} from '@shared/db'
import type { ContentEntityType } from '@shared/common'

// =============================================================================
// Props & Emits
// =============================================================================

const open = defineModel<boolean>('open', { required: true })

// =============================================================================
// Data Fetching
// =============================================================================

async function fetchSections(): Promise<ShowcaseSectionFormItem[]> {
  const sections = await db.query.showcaseSections.findMany({
    orderBy: asc(showcaseSections.order)
  })
  return sections as ShowcaseSectionFormItem[]
}

const { data, isLoading, error } = useAsyncData(fetchSections, {
  enabled: open
})
const state = useRenderState(isLoading, error, data)

// =============================================================================
// Local State
// =============================================================================

const items = ref<ShowcaseSectionFormItem[]>([])
const editingItem = ref<ShowcaseSectionFormItem | null>(null)
const isAddMode = ref(false)
const deleteIndex = ref<number | null>(null)
const isPresetDialogOpen = ref(false)
const isSaving = ref(false)

// Computed for item form dialog open state
const itemFormOpen = computed({
  get: () => editingItem.value !== null,
  set: (value) => {
    if (!value) editingItem.value = null
  }
})

// Computed for delete dialog open state
const deleteDialogOpen = computed({
  get: () => deleteIndex.value !== null,
  set: (value) => {
    if (!value) deleteIndex.value = null
  }
})

// Sync local items with fetched data
watch(data, (newData) => {
  items.value = newData ?? []
})

// =============================================================================
// Handlers
// =============================================================================

async function handleSave() {
  isSaving.value = true
  try {
    const originalIds = new Set((data.value ?? []).map((s) => s.id))
    const currentIds = new Set(items.value.filter((i) => !i.isNew).map((i) => i.id))

    // Diff-based update to avoid UI flicker
    // 1. Delete removed sections
    const toDelete = [...originalIds].filter((id) => !currentIds.has(id))
    for (const id of toDelete) {
      await db.delete(showcaseSections).where(eq(showcaseSections.id, id))
    }

    // 2. Insert new sections
    const toInsert = items.value.filter((item) => item.isNew)
    for (const item of toInsert) {
      const index = items.value.indexOf(item)
      await db.insert(showcaseSections).values({
        id: nanoid(),
        entityType: item.entityType,
        name: item.name,
        order: index,
        isVisible: item.isVisible,
        layout: item.layout,
        itemSize: item.itemSize,
        openMode: item.openMode,
        limit: item.limit,
        filter: item.filter,
        sortField: item.sortField,
        sortDirection: item.sortDirection
      })
    }

    // 3. Update existing sections (order and other fields)
    const toUpdate = items.value.filter((item) => !item.isNew && originalIds.has(item.id))
    for (const item of toUpdate) {
      const index = items.value.indexOf(item)
      await db
        .update(showcaseSections)
        .set({
          entityType: item.entityType,
          name: item.name,
          order: index,
          isVisible: item.isVisible,
          layout: item.layout,
          itemSize: item.itemSize,
          openMode: item.openMode,
          limit: item.limit,
          filter: item.filter,
          sortField: item.sortField,
          sortDirection: item.sortDirection
        })
        .where(eq(showcaseSections.id, item.id))
    }

    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Save failed:', error)
    notify.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const n = [...items.value]
  const temp = n[index - 1]
  n[index - 1] = n[index]!
  n[index] = temp!
  items.value = n
}

function handleMoveDown(index: number) {
  if (index >= items.value.length - 1) return
  const n = [...items.value]
  const temp = n[index]
  n[index] = n[index + 1]!
  n[index + 1] = temp!
  items.value = n
}

function handleRemove() {
  if (deleteIndex.value === null) return
  items.value = items.value.filter((_, i) => i !== deleteIndex.value)
  deleteIndex.value = null
}

function handleEdit(item: ShowcaseSectionFormItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    entityType: 'game' as ContentEntityType,
    name: '',
    order: items.value.length,
    isVisible: true,
    layout: 'horizontal' as SectionLayout,
    itemSize: 'md' as SectionItemSize,
    openMode: 'page' as SectionOpenMode,
    limit: null,
    filter: {},
    sortField: 'name',
    sortDirection: 'asc' as SortDirection,
    isNew: true
  }
  isAddMode.value = true
}

function handleToggleVisibility(index: number) {
  items.value = items.value.map((item, i) =>
    i === index ? { ...item, isVisible: !item.isVisible } : item
  )
}

function handleItemDialogSave(updatedItem: ShowcaseSectionFormItem) {
  if (isAddMode.value) {
    items.value = [...items.value, updatedItem]
  } else {
    items.value = items.value.map((item) => (item.id === updatedItem.id ? updatedItem : item))
  }
  editingItem.value = null
  isAddMode.value = false
}

function handleItemDialogCancel() {
  editingItem.value = null
  isAddMode.value = false
}

function handleAddPresets(presetSections: ShowcaseSectionFormItem[]) {
  items.value = [...items.value, ...presetSections]
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <!-- Loading state -->
  <Dialog
    v-if="state === 'loading'"
    v-model:open="open"
  >
    <DialogContent class="max-w-2xl">
      <div class="flex items-center justify-center py-12">
        <Spinner class="size-6" />
      </div>
    </DialogContent>
  </Dialog>

  <!-- Main content -->
  <template v-else>
    <Dialog v-model:open="open">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>管理区块</DialogTitle>
        </DialogHeader>

        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-1">
            <template v-if="items.length === 0">
              <p class="text-sm text-muted-foreground text-center py-8">
                暂无区块，点击下方按钮添加
              </p>
            </template>
            <template v-else>
              <LibraryShowcaseSectionsItem
                v-for="(item, index) in items"
                :key="item.id"
                :item="item"
                :index="index"
                :is-first="index === 0"
                :is-last="index === items.length - 1"
                @move-up="handleMoveUp(index)"
                @move-down="handleMoveDown(index)"
                @toggle-visibility="handleToggleVisibility(index)"
                @edit="handleEdit(item)"
                @delete="deleteIndex = index"
              />
            </template>
          </div>
        </DialogBody>

        <DialogFooter class="justify-between">
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="handleAddNew"
            >
              <span class="icon-[mdi--plus] size-4 mr-1" />
              添加区块
            </Button>
            <Button
              variant="outline"
              @click="isPresetDialogOpen = true"
            >
              <span class="icon-[mdi--lightning-bolt-outline] size-4 mr-1" />
              选择预设
            </Button>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="handleClose"
            >
              取消
            </Button>
            <Button
              :disabled="isSaving"
              @click="handleSave"
            >
              {{ isSaving ? '保存中...' : '保存' }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Inline item form dialog -->
    <LibraryShowcaseSectionItemFormDialog
      v-if="editingItem"
      v-model:open="itemFormOpen"
      :item="editingItem"
      :is-new="isAddMode"
      @save="handleItemDialogSave"
      @cancel="handleItemDialogCancel"
    />

    <!-- Preset selection dialog -->
    <LibraryShowcaseSectionPresetsDialog
      v-if="isPresetDialogOpen"
      v-model:open="isPresetDialogOpen"
      @add="handleAddPresets"
    />

    <!-- Delete confirmation -->
    <DeleteConfirmDialog
      v-if="deleteIndex !== null"
      v-model:open="deleteDialogOpen"
      entity-label="区块"
      :entity-name="deleteIndex !== null ? items[deleteIndex]?.name : ''"
      mode="remove"
      @confirm="handleRemove"
    />
  </template>
</template>
