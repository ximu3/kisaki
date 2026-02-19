<!--
  GameTagsFormDialog
  Dialog for editing game tags.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { eq, asc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { tags, gameTagLinks } from '@shared/db'
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
import { SpoilerConfirmDialog } from '@renderer/components/ui/spoiler-confirm-dialog'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import GameTagsItem from './tag-item.vue'
import GameTagsItemFormDialog from './tag-item-form-dialog.vue'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface TagItem {
  id: string
  tagId: string
  tagName: string
  note: string
  isSpoiler: boolean
  orderInGame: number
  isNew?: boolean
}

// Form state
const items = ref<TagItem[]>([])
const editingItem = ref<TagItem | null>(null)
const isAddMode = ref(false)
const deleteIndex = ref<number | null>(null)
const isSaving = ref(false)
const itemFormOpen = ref(false)
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

// Fetch game tags when dialog opens
const { data: results, isLoading } = useAsyncData(
  () =>
    db
      .select()
      .from(gameTagLinks)
      .leftJoin(tags, eq(gameTagLinks.tagId, tags.id))
      .where(eq(gameTagLinks.gameId, props.gameId))
      .orderBy(asc(gameTagLinks.orderInGame)),
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(results, (data) => {
  if (data) {
    items.value = data.map((row) => ({
      id: row.game_tag_links.id,
      tagId: row.game_tag_links.tagId,
      tagName: row.tags?.name || '',
      note: row.game_tag_links.note || '',
      isSpoiler: row.game_tag_links.isSpoiler,
      orderInGame: row.game_tag_links.orderInGame
    }))
  }
})

const existingTagIds = computed(() => items.value.map((item) => item.tagId))

const deleteDialogOpen = computed({
  get: () => deleteIndex.value !== null,
  set: (v) => {
    if (!v) deleteIndex.value = null
  }
})

const itemFormInitialData = computed(() => {
  if (!editingItem.value || isAddMode.value) return undefined
  return {
    tagId: editingItem.value.tagId,
    tagName: editingItem.value.tagName,
    note: editingItem.value.note,
    isSpoiler: editingItem.value.isSpoiler
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await db.delete(gameTagLinks).where(eq(gameTagLinks.gameId, props.gameId))
    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      await db.insert(gameTagLinks).values({
        id: item.isNew ? nanoid() : item.id,
        gameId: props.gameId,
        tagId: item.tagId,
        isSpoiler: item.isSpoiler,
        note: item.note || null,
        orderInGame: i,
        orderInTag: 0
      })
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

function handleRemove(index: number) {
  items.value.splice(index, 1)
  deleteIndex.value = null
}

function handleEdit(item: TagItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
  itemFormOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    tagId: '',
    tagName: '',
    note: '',
    isSpoiler: false,
    orderInGame: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  itemFormOpen.value = true
}

function handleItemFormSubmit(data: {
  tagId: string
  tagName: string
  note: string
  isSpoiler: boolean
}) {
  const updatedItem: TagItem = {
    id: editingItem.value!.id,
    tagId: data.tagId,
    tagName: data.tagName,
    note: data.note,
    isSpoiler: data.isSpoiler,
    orderInGame: editingItem.value!.orderInGame,
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
      <!-- Loading state -->
      <template v-if="isLoading || !results">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
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
            <GameTagsItem
              v-for="(item, index) in items"
              v-else
              :key="item.id"
              :tag-name="item.tagName"
              :note="item.note"
              :is-spoiler="item.isSpoiler"
              :spoilers-revealed="spoilersRevealed"
              :is-first="index === 0"
              :is-last="index === items.length - 1"
              @move-up="handleMoveUp(index)"
              @move-down="handleMoveDown(index)"
              @edit="handleEdit(item)"
              @delete="deleteIndex = index"
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

  <!-- Delete confirmation dialog -->
  <DeleteConfirmDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    entity-label="标签关联"
    mode="remove"
    @confirm="deleteIndex !== null && handleRemove(deleteIndex)"
  />

  <!-- Tag item form dialog -->
  <GameTagsItemFormDialog
    v-if="itemFormOpen"
    v-model:open="itemFormOpen"
    :initial-data="itemFormInitialData"
    :exclude-ids="existingTagIds"
    @submit="handleItemFormSubmit"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
