<!--
  PersonGamesFormDialog
  Dialog for editing person's related games grouped by role.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { eq, asc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { gamePersonLinks, type GamePersonType } from '@shared/db'
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
import PersonGamesItem from './game-item.vue'
import PersonGamesItemFormDialog from './game-item-form-dialog.vue'

interface Props {
  personId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface GameLinkItem {
  id: string
  gameId: string
  gameName: string
  gameCover: string | null
  type: GamePersonType
  note: string
  isSpoiler: boolean
  orderInPerson: number
  isNew?: boolean
}

const PERSON_TYPE_LABELS: Record<string, string> = {
  director: '导演',
  scenario: '剧本',
  illustration: '原画',
  music: '音乐',
  programmer: '程序',
  actor: '声优',
  other: '其他'
}

const PERSON_TYPE_ORDER: GamePersonType[] = [
  'director',
  'scenario',
  'illustration',
  'music',
  'programmer',
  'actor',
  'other'
]

// Form state
const items = ref<GameLinkItem[]>([])
const editingItem = ref<GameLinkItem | null>(null)
const isAddMode = ref(false)
const deleteId = ref<string | null>(null)
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

// Fetch person games when dialog opens
const { data: results, isLoading } = useAsyncData(
  () =>
    db.query.gamePersonLinks.findMany({
      where: eq(gamePersonLinks.personId, props.personId),
      with: { game: true },
      orderBy: asc(gamePersonLinks.orderInPerson)
    }),
  {
    watch: [() => props.personId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(results, (data) => {
  if (data) {
    items.value = data
      .filter((link) => link.game)
      .map((link) => ({
        id: link.id,
        gameId: link.gameId,
        gameName: link.game!.name,
        gameCover: link.game!.coverFile,
        type: link.type as GamePersonType,
        note: link.note || '',
        isSpoiler: link.isSpoiler,
        orderInPerson: link.orderInPerson
      }))
  }
})

// Grouped games by type
const groupedGames = computed(() => {
  const grouped: Record<GamePersonType, GameLinkItem[]> = {
    director: [],
    scenario: [],
    illustration: [],
    music: [],
    programmer: [],
    actor: [],
    other: []
  }
  items.value.forEach((item) => {
    grouped[item.type].push(item)
  })
  for (const type of PERSON_TYPE_ORDER) {
    grouped[type].sort((a, b) => a.orderInPerson - b.orderInPerson)
  }
  return grouped
})

// Existing game IDs for excluding from select
const existingGameIds = computed(() => items.value.map((item) => item.gameId))

// Delete dialog state
const deleteDialogOpen = computed({
  get: () => deleteId.value !== null,
  set: (v) => {
    if (!v) deleteId.value = null
  }
})

// Item form initial data
const itemFormInitialData = computed(() => {
  if (!editingItem.value || isAddMode.value) return undefined
  return {
    gameId: editingItem.value.gameId,
    gameName: editingItem.value.gameName,
    gameCover: editingItem.value.gameCover,
    type: editingItem.value.type,
    note: editingItem.value.note,
    isSpoiler: editingItem.value.isSpoiler
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await db.delete(gamePersonLinks).where(eq(gamePersonLinks.personId, props.personId))

    if (items.value.length > 0) {
      const linksToInsert: {
        id: string
        personId: string
        gameId: string
        isSpoiler: boolean
        type: GamePersonType
        note: string | null
        orderInPerson: number
      }[] = []

      for (const type of PERSON_TYPE_ORDER) {
        const typeLinks = groupedGames.value[type]
        typeLinks.forEach((link, index) => {
          linksToInsert.push({
            id: link.isNew ? nanoid() : link.id,
            personId: props.personId,
            gameId: link.gameId,
            isSpoiler: link.isSpoiler,
            type: link.type,
            note: link.note || null,
            orderInPerson: index
          })
        })
      }

      if (linksToInsert.length > 0) {
        await db.insert(gamePersonLinks).values(linksToInsert)
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

function handleMoveUp(type: GamePersonType, index: number) {
  if (index <= 0) return
  const typeLinks = [...groupedGames.value[type]]
  ;[typeLinks[index - 1], typeLinks[index]] = [typeLinks[index], typeLinks[index - 1]]
  typeLinks.forEach((link, i) => {
    link.orderInPerson = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleMoveDown(type: GamePersonType, index: number) {
  const typeLinks = [...groupedGames.value[type]]
  if (index >= typeLinks.length - 1) return
  ;[typeLinks[index], typeLinks[index + 1]] = [typeLinks[index + 1], typeLinks[index]]
  typeLinks.forEach((link, i) => {
    link.orderInPerson = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleRemove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
  deleteId.value = null
}

function handleEdit(item: GameLinkItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
  itemFormOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    gameId: '',
    gameName: '',
    gameCover: null,
    type: 'other',
    note: '',
    isSpoiler: false,
    orderInPerson: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  itemFormOpen.value = true
}

function handleItemFormSubmit(data: {
  gameId: string
  gameName: string
  gameCover: string | null
  type: GamePersonType
  note: string
  isSpoiler: boolean
}) {
  const updatedItem: GameLinkItem = {
    id: editingItem.value!.id,
    gameId: data.gameId,
    gameName: data.gameName,
    gameCover: data.gameCover,
    type: data.type,
    note: data.note,
    isSpoiler: data.isSpoiler,
    orderInPerson: editingItem.value!.orderInPerson,
    isNew: editingItem.value!.isNew
  }

  if (isAddMode.value) {
    const typeLinks = groupedGames.value[updatedItem.type]
    updatedItem.orderInPerson = typeLinks.length
    items.value.push(updatedItem)
  } else {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      if (editingItem.value && editingItem.value.type !== updatedItem.type) {
        const newTypeLinks = groupedGames.value[updatedItem.type]
        updatedItem.orderInPerson = newTypeLinks.length
      }
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
          <DialogTitle>编辑参与游戏</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-4">
            <p
              v-if="items.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无参与游戏，点击下方按钮添加
            </p>
            <template v-else>
              <template
                v-for="type in PERSON_TYPE_ORDER"
                :key="type"
              >
                <div v-if="groupedGames[type].length > 0">
                  <h4 class="text-xs font-medium text-muted-foreground mb-2">
                    {{ PERSON_TYPE_LABELS[type] }}
                  </h4>
                  <div class="space-y-1">
                    <PersonGamesItem
                      v-for="(link, index) in groupedGames[type]"
                      :key="link.id"
                      :game-id="link.gameId"
                      :game-name="link.gameName"
                      :game-cover="link.gameCover"
                      :note="link.note"
                      :is-spoiler="link.isSpoiler"
                      :spoilers-revealed="spoilersRevealed"
                      :is-first="index === 0"
                      :is-last="index === groupedGames[type].length - 1"
                      @move-up="handleMoveUp(type, index)"
                      @move-down="handleMoveDown(type, index)"
                      @edit="handleEdit(link)"
                      @delete="deleteId = link.id"
                    />
                  </div>
                </div>
              </template>
            </template>
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
    entity-label="游戏关联"
    mode="remove"
    @confirm="deleteId !== null && handleRemove(deleteId)"
  />

  <!-- Game item form dialog -->
  <PersonGamesItemFormDialog
    v-if="itemFormOpen"
    v-model:open="itemFormOpen"
    :initial-data="itemFormInitialData"
    :exclude-ids="existingGameIds"
    @submit="handleItemFormSubmit"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
