<!--
  CompanyTagsFormDialog
  Dialog for editing company tags.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@renderer/core/db'
import { companyTagLinks } from '@shared/db'
import { useAsyncData, useRenderState } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import { notify } from '@renderer/core/notify'
import CompanyTagsItem from './tag-item.vue'
import CompanyTagsItemFormDialog from './tag-item-form-dialog.vue'

interface TagItem {
  id: string
  tagId: string
  tagName: string
  note: string
  isSpoiler: boolean
  orderInCompany: number
  isNew?: boolean
}

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
const items = ref<TagItem[]>([])
const deleteIndex = ref<number | null>(null)
const formOpen = ref(false)
const editingItem = ref<TagItem | null>(null)
const isAddMode = ref(false)
const isSaving = ref(false)
const spoilersRevealed = ref(false)
const spoilerConfirmOpen = ref(false)

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      spoilersRevealed.value = false
      spoilerConfirmOpen.value = false
    }
  }
)

// Fetch tag links when dialog opens
const {
  data: fetchedData,
  isLoading,
  error
} = useAsyncData(
  async () => {
    const links = await db.query.companyTagLinks.findMany({
      where: eq(companyTagLinks.companyId, props.companyId),
      orderBy: asc(companyTagLinks.orderInCompany),
      with: { tag: true }
    })
    return links.map((link) => ({
      id: link.id,
      tagId: link.tagId,
      tagName: link.tag?.name || '',
      note: link.note || '',
      isSpoiler: link.isSpoiler,
      orderInCompany: link.orderInCompany
    }))
  },
  {
    watch: [() => props.companyId],
    enabled: () => open.value
  }
)
const state = useRenderState(isLoading, error, fetchedData)

// Initialize form state when data loads
watch(fetchedData, (data) => {
  items.value = data ? [...data] : []
})

const existingTagIds = computed(() => items.value.map((item) => item.tagId))

async function handleSave() {
  isSaving.value = true
  try {
    // Delete all existing links
    await db.delete(companyTagLinks).where(eq(companyTagLinks.companyId, props.companyId))

    // Insert new links
    if (items.value.length > 0) {
      await db.insert(companyTagLinks).values(
        items.value.map((item, index) => ({
          id: item.isNew ? nanoid() : item.id,
          companyId: props.companyId,
          tagId: item.tagId,
          isSpoiler: item.isSpoiler,
          note: item.note || null,
          orderInCompany: index
        }))
      )
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
  if (index > 0) {
    const temp = items.value[index]
    items.value[index] = items.value[index - 1]
    items.value[index - 1] = temp
  }
}

function handleMoveDown(index: number) {
  if (index < items.value.length - 1) {
    const temp = items.value[index]
    items.value[index] = items.value[index + 1]
    items.value[index + 1] = temp
  }
}

function handleEdit(item: TagItem) {
  editingItem.value = item
  isAddMode.value = false
  formOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    tagId: '',
    tagName: '',
    note: '',
    isSpoiler: false,
    orderInCompany: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  formOpen.value = true
}

function handleFormSubmit(updatedItem: TagItem) {
  if (isAddMode.value) {
    items.value.push(updatedItem)
  } else {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  }
}

function handleDeleteConfirm() {
  if (deleteIndex.value !== null) {
    items.value.splice(deleteIndex.value, 1)
    deleteIndex.value = null
  }
}

const deleteDialogOpen = computed({
  get: () => deleteIndex.value !== null,
  set: (v) => {
    if (!v) deleteIndex.value = null
  }
})

function handleToggleSpoilers() {
  if (spoilersRevealed.value) {
    spoilersRevealed.value = false
    return
  }
  spoilerConfirmOpen.value = true
}

function handleRevealSpoilersConfirm() {
  spoilersRevealed.value = true
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑标签</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-1">
            <p
              v-if="items.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无标签，点击下方按钮添加
            </p>
            <CompanyTagsItem
              v-for="(item, index) in items"
              :key="item.id"
              :item="item"
              :index="index"
              :is-first="index === 0"
              :is-last="index === items.length - 1"
              :spoilers-revealed="spoilersRevealed"
              @edit="handleEdit"
              @delete="(i) => (deleteIndex = i)"
              @move-up="handleMoveUp"
              @move-down="handleMoveDown"
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
            添加标签
          </Button>
          <div class="flex gap-2">
            <Button
              variant="outline"
              @click="handleToggleSpoilers"
            >
              <Icon
                :icon="spoilersRevealed ? 'icon-[mdi--eye-off-outline]' : 'icon-[mdi--eye-outline]'"
                class="size-4 mr-1.5"
              />
              {{ spoilersRevealed ? '隐藏剧透' : '显示剧透' }}
            </Button>
            <Button
              variant="outline"
              @click="open = false"
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

  <CompanyTagsItemFormDialog
    v-if="formOpen"
    v-model:open="formOpen"
    :item="editingItem"
    :existing-tag-ids="existingTagIds"
    :is-add-mode="isAddMode"
    @submit="handleFormSubmit"
  />

  <DeleteConfirmDialog
    v-model:open="deleteDialogOpen"
    entity-label="标签"
    @confirm="handleDeleteConfirm"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
