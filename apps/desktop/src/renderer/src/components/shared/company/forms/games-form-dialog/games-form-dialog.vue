<!--
  CompanyGamesFormDialog
  Dialog for editing company's related games grouped by role.
  Uses two-layer pattern: outer handles data fetching, inner handles form state.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '@renderer/core/db'
import { gameCompanyLinks } from '@shared/db'
import type { GameCompanyType } from '@shared/db'
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
import CompanyGamesItem from './game-item.vue'
import CompanyGamesItemFormDialog from './game-item-form-dialog.vue'

const COMPANY_TYPE_ORDER: GameCompanyType[] = ['developer', 'publisher', 'distributor', 'other']
const COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发',
  publisher: '发行',
  distributor: '分销',
  other: '其他'
}

interface GameLinkItem {
  id: string
  gameId: string
  gameName: string
  gameCover: string | null
  type: GameCompanyType
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
const items = ref<GameLinkItem[]>([])
const deleteId = ref<string | null>(null)
const formOpen = ref(false)
const editingItem = ref<GameLinkItem | undefined>(undefined)
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

// Fetch game links when dialog opens
const {
  data: fetchedData,
  isLoading,
  error
} = useAsyncData(
  async () => {
    const links = await db.query.gameCompanyLinks.findMany({
      where: eq(gameCompanyLinks.companyId, props.companyId),
      orderBy: asc(gameCompanyLinks.orderInCompany),
      with: { game: true }
    })
    return links.map((link) => ({
      id: link.id,
      gameId: link.gameId,
      gameName: link.game?.name || '',
      gameCover: link.game?.coverFile || null,
      type: link.type as GameCompanyType,
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

const existingGameIds = computed(() => items.value.map((item) => item.gameId))

// Group items by type
const groupedItems = computed(() => {
  const groups: Record<GameCompanyType, GameLinkItem[]> = {
    developer: [],
    publisher: [],
    distributor: [],
    other: []
  }
  for (const item of items.value) {
    groups[item.type].push(item)
  }
  return groups
})

async function handleSave() {
  isSaving.value = true
  try {
    // Delete all existing links for this company
    await db.delete(gameCompanyLinks).where(eq(gameCompanyLinks.companyId, props.companyId))

    // Insert new links with order by type groups
    if (items.value.length > 0) {
      let globalOrder = 0
      const values: {
        id: string
        companyId: string
        gameId: string
        isSpoiler: boolean
        type: GameCompanyType
        note: string | null
        orderInCompany: number
      }[] = []

      for (const type of COMPANY_TYPE_ORDER) {
        for (const item of groupedItems.value[type]) {
          values.push({
            id: item.isNew ? nanoid() : item.id,
            companyId: props.companyId,
            gameId: item.gameId,
            isSpoiler: item.isSpoiler,
            type: item.type,
            note: item.note || null,
            orderInCompany: globalOrder++
          })
        }
      }

      if (values.length > 0) {
        await db.insert(gameCompanyLinks).values(values)
      }
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

function handleAddClick() {
  editingItem.value = undefined
  isAddMode.value = true
  formOpen.value = true
}

function handleEditClick(item: GameLinkItem) {
  editingItem.value = item
  isAddMode.value = false
  formOpen.value = true
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

function handleFormSubmit(data: GameLinkItem) {
  if (isAddMode.value) {
    items.value.push(data)
  } else {
    const index = items.value.findIndex((item) => item.id === data.id)
    if (index !== -1) {
      items.value[index] = data
    }
  }
}

function handleDeleteConfirm() {
  if (deleteId.value !== null) {
    const index = items.value.findIndex((item) => item.id === deleteId.value)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
    deleteId.value = null
  }
}

function handleMoveUp(type: GameCompanyType, index: number) {
  const typeItems = groupedItems.value[type]
  if (index > 0) {
    // Find items in main array and swap
    const itemA = typeItems[index]
    const itemB = typeItems[index - 1]
    const indexA = items.value.findIndex((i) => i.id === itemA.id)
    const indexB = items.value.findIndex((i) => i.id === itemB.id)
    if (indexA !== -1 && indexB !== -1) {
      const temp = items.value[indexA]
      items.value[indexA] = items.value[indexB]
      items.value[indexB] = temp
    }
  }
}

function handleMoveDown(type: GameCompanyType, index: number) {
  const typeItems = groupedItems.value[type]
  if (index < typeItems.length - 1) {
    const itemA = typeItems[index]
    const itemB = typeItems[index + 1]
    const indexA = items.value.findIndex((i) => i.id === itemA.id)
    const indexB = items.value.findIndex((i) => i.id === itemB.id)
    if (indexA !== -1 && indexB !== -1) {
      const temp = items.value[indexA]
      items.value[indexA] = items.value[indexB]
      items.value[indexB] = temp
    }
  }
}

const deleteDialogOpen = computed({
  get: () => deleteId.value !== null,
  set: (v) => {
    if (!v) deleteId.value = null
  }
})
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
          <DialogTitle>编辑相关游戏</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div
            v-if="items.length === 0"
            class="text-sm text-muted-foreground text-center py-8"
          >
            暂无相关游戏，点击下方按钮添加
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <template
              v-for="type in COMPANY_TYPE_ORDER"
              :key="type"
            >
              <div v-if="groupedItems[type].length > 0">
                <h4 class="text-xs font-medium text-muted-foreground mb-2">
                  {{ COMPANY_TYPE_LABELS[type] }}
                </h4>
                <div class="space-y-1">
                  <CompanyGamesItem
                    v-for="(item, index) in groupedItems[type]"
                    :key="item.id"
                    :item="item"
                    :index="index"
                    :is-first="index === 0"
                    :is-last="index === groupedItems[type].length - 1"
                    :spoilers-revealed="spoilersRevealed"
                    @edit="handleEditClick"
                    @delete="(id) => (deleteId = id)"
                    @move-up="(i) => handleMoveUp(type, i)"
                    @move-down="(i) => handleMoveDown(type, i)"
                  />
                </div>
              </div>
            </template>
          </div>
        </DialogBody>
        <DialogFooter class="flex justify-between">
          <Button
            variant="outline"
            @click="handleAddClick"
          >
            <Icon
              icon="icon-[mdi--plus]"
              class="size-4 mr-1.5"
            />
            添加游戏
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

  <CompanyGamesItemFormDialog
    v-if="formOpen"
    v-model:open="formOpen"
    :initial-data="editingItem"
    :existing-game-ids="existingGameIds"
    :is-add-mode="isAddMode"
    @submit="handleFormSubmit"
  />

  <DeleteConfirmDialog
    v-model:open="deleteDialogOpen"
    entity-label="游戏"
    @confirm="handleDeleteConfirm"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
