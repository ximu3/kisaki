<!--
  PersonExternalIdsFormDialog
  Dialog for editing person external IDs.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { eq, asc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { personExternalIds } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
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
import { notify } from '@renderer/core/notify'
import PersonExternalIdItem from './external-id-item.vue'
import PersonExternalIdItemFormDialog from './external-id-item-form-dialog.vue'

interface Props {
  personId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface ExternalIdItem {
  id: string
  source: string
  externalId: string
  orderInPerson: number
  isNew?: boolean
}

const items = ref<ExternalIdItem[]>([])
const editingItem = ref<ExternalIdItem | null>(null)
const isAddMode = ref(false)
const deleteId = ref<string | null>(null)
const isSaving = ref(false)
const itemFormOpen = ref(false)

const { data: results, isLoading } = useAsyncData(
  () =>
    db
      .select()
      .from(personExternalIds)
      .where(eq(personExternalIds.personId, props.personId))
      .orderBy(asc(personExternalIds.orderInPerson)),
  {
    watch: [() => props.personId],
    enabled: () => open.value
  }
)

watch(results, (data) => {
  if (!data) return

  items.value = data.map((item) => ({
    id: item.id,
    source: item.source,
    externalId: item.externalId,
    orderInPerson: item.orderInPerson
  }))
})

const deleteDialogOpen = computed({
  get: () => deleteId.value !== null,
  set: (v) => {
    if (!v) deleteId.value = null
  }
})

const itemFormInitialData = computed(() => {
  if (!editingItem.value || isAddMode.value) return undefined
  return {
    source: editingItem.value.source,
    externalId: editingItem.value.externalId
  }
})

async function handleSave() {
  isSaving.value = true

  try {
    const normalizedItems = items.value.map((item) => ({
      ...item,
      source: item.source.trim(),
      externalId: item.externalId.trim()
    }))

    const seen = new Set<string>()
    for (const item of normalizedItems) {
      if (!item.source || !item.externalId) {
        notify.error('外部ID中存在空值，请检查后重试')
        return
      }
      const key = `${item.source}\u0000${item.externalId}`
      if (seen.has(key)) {
        notify.error('存在重复的外部ID，请检查后重试')
        return
      }
      seen.add(key)
    }

    await db.delete(personExternalIds).where(eq(personExternalIds.personId, props.personId))

    if (normalizedItems.length > 0) {
      await db.insert(personExternalIds).values(
        normalizedItems.map((item, index) => ({
          id: item.isNew ? nanoid() : item.id,
          personId: props.personId,
          source: item.source,
          externalId: item.externalId,
          orderInPerson: index
        }))
      )
    }

    notify.success('已保存')
    open.value = false
  } catch (error) {
    console.error('Save failed:', error)
    notify.error('保存失败，请检查是否与其他实体存在重复外部ID')
  } finally {
    isSaving.value = false
  }
}

function handleRemove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
  deleteId.value = null
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const temp = items.value[index - 1]
  items.value[index - 1] = items.value[index]
  items.value[index] = temp
}

function handleMoveDown(index: number) {
  if (index >= items.value.length - 1) return
  const temp = items.value[index]
  items.value[index] = items.value[index + 1]
  items.value[index + 1] = temp
}

function handleEdit(item: ExternalIdItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
  itemFormOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    source: '',
    externalId: '',
    orderInPerson: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  itemFormOpen.value = true
}

function handleItemFormSubmit(data: {
  source: string
  externalId: string
}) {
  const updatedItem: ExternalIdItem = {
    id: editingItem.value!.id,
    source: data.source,
    externalId: data.externalId,
    orderInPerson: editingItem.value!.orderInPerson,
    isNew: editingItem.value!.isNew
  }

  if (isAddMode.value) {
    items.value.push(updatedItem)
  } else {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  }

  itemFormOpen.value = false
  editingItem.value = null
  isAddMode.value = false
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <template v-if="isLoading || !results">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>管理外部ID</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-1">
            <p
              v-if="items.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无外部ID，点击下方按钮添加
            </p>
            <PersonExternalIdItem
              v-for="(item, index) in items"
              :key="item.id"
              :source="item.source"
              :external-id="item.externalId"
              :is-first="index === 0"
              :is-last="index === items.length - 1"
              @move-up="handleMoveUp(index)"
              @move-down="handleMoveDown(index)"
              @edit="handleEdit(item)"
              @delete="deleteId = item.id"
            />
          </div>
        </DialogBody>
        <DialogFooter class="flex justify-between">
          <Button
            variant="outline"
            @click="handleAddNew"
          >
            <Icon
              icon="icon-[mdi--plus]"
              class="size-4 mr-1.5"
            />
            添加外部ID
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="handleCancel"
            >
              取消
            </Button>
            <Button
              :disabled="isSaving"
              @click="handleSave"
            >
              保存
            </Button>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <DeleteConfirmDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    entity-label="外部ID"
    mode="remove"
    @confirm="deleteId !== null && handleRemove(deleteId)"
  />

  <PersonExternalIdItemFormDialog
    v-if="itemFormOpen"
    v-model:open="itemFormOpen"
    :initial-data="itemFormInitialData"
    @submit="handleItemFormSubmit"
  />
</template>
