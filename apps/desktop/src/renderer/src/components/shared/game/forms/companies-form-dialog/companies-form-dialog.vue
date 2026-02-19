<!--
  GameCompaniesFormDialog
  Dialog for editing game companies grouped by type.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { eq, asc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { gameCompanyLinks } from '@shared/db'
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
import GameCompaniesItem from './company-item.vue'
import GameCompaniesItemFormDialog from './company-item-form-dialog.vue'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

type CompanyType = 'developer' | 'publisher' | 'distributor' | 'other'

interface CompanyLinkItem {
  id: string
  companyId: string
  companyName: string
  type: CompanyType
  note: string
  isSpoiler: boolean
  orderInGame: number
  isNew?: boolean
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  developer: '开发',
  publisher: '发行',
  distributor: '分销',
  other: '其他'
}

const COMPANY_TYPE_ORDER: CompanyType[] = ['developer', 'publisher', 'distributor', 'other']

// Form state
const items = ref<CompanyLinkItem[]>([])
const editingItem = ref<CompanyLinkItem | null>(null)
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

// Fetch game companies when dialog opens
const { data: results, isLoading } = useAsyncData(
  () =>
    db.query.gameCompanyLinks.findMany({
      where: eq(gameCompanyLinks.gameId, props.gameId),
      with: { company: true },
      orderBy: asc(gameCompanyLinks.orderInGame)
    }),
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(results, (data) => {
  if (data) {
    items.value = data
      .filter((link) => link.company)
      .map((link) => ({
        id: link.id,
        companyId: link.companyId,
        companyName: link.company!.name,
        type: link.type as CompanyType,
        note: link.note || '',
        isSpoiler: link.isSpoiler,
        orderInGame: link.orderInGame
      }))
  }
})

// Grouped companies by type
const groupedCompanies = computed(() => {
  const grouped: Record<CompanyType, CompanyLinkItem[]> = {
    developer: [],
    publisher: [],
    distributor: [],
    other: []
  }
  items.value.forEach((item) => {
    grouped[item.type].push(item)
  })
  for (const type of COMPANY_TYPE_ORDER) {
    grouped[type].sort((a, b) => a.orderInGame - b.orderInGame)
  }
  return grouped
})

// Existing company IDs for excluding from select
const existingCompanyIds = computed(() => items.value.map((item) => item.companyId))

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
    companyId: editingItem.value.companyId,
    companyName: editingItem.value.companyName,
    type: editingItem.value.type,
    note: editingItem.value.note,
    isSpoiler: editingItem.value.isSpoiler
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await db.delete(gameCompanyLinks).where(eq(gameCompanyLinks.gameId, props.gameId))

    if (items.value.length > 0) {
      const linksToInsert: {
        id: string
        gameId: string
        companyId: string
        isSpoiler: boolean
        type: CompanyType
        note: string | null
        orderInGame: number
      }[] = []

      for (const type of COMPANY_TYPE_ORDER) {
        const typeLinks = groupedCompanies.value[type]
        typeLinks.forEach((link, index) => {
          linksToInsert.push({
            id: link.isNew ? nanoid() : link.id,
            gameId: props.gameId,
            companyId: link.companyId,
            isSpoiler: link.isSpoiler,
            type: link.type,
            note: link.note || null,
            orderInGame: index
          })
        })
      }

      if (linksToInsert.length > 0) {
        await db.insert(gameCompanyLinks).values(linksToInsert)
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

function handleMoveUp(type: CompanyType, index: number) {
  if (index <= 0) return
  const typeLinks = [...groupedCompanies.value[type]]
  ;[typeLinks[index - 1], typeLinks[index]] = [typeLinks[index], typeLinks[index - 1]]
  typeLinks.forEach((link, i) => {
    link.orderInGame = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleMoveDown(type: CompanyType, index: number) {
  const typeLinks = [...groupedCompanies.value[type]]
  if (index >= typeLinks.length - 1) return
  ;[typeLinks[index], typeLinks[index + 1]] = [typeLinks[index + 1], typeLinks[index]]
  typeLinks.forEach((link, i) => {
    link.orderInGame = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleRemove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
  deleteId.value = null
}

function handleEdit(item: CompanyLinkItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
  itemFormOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    companyId: '',
    companyName: '',
    type: 'developer',
    note: '',
    isSpoiler: false,
    orderInGame: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  itemFormOpen.value = true
}

function handleItemFormSubmit(data: {
  companyId: string
  companyName: string
  type: CompanyType
  note: string
  isSpoiler: boolean
}) {
  const updatedItem: CompanyLinkItem = {
    id: editingItem.value!.id,
    companyId: data.companyId,
    companyName: data.companyName,
    type: data.type,
    note: data.note,
    isSpoiler: data.isSpoiler,
    orderInGame: editingItem.value!.orderInGame,
    isNew: editingItem.value!.isNew
  }

  if (isAddMode.value) {
    const typeLinks = groupedCompanies.value[updatedItem.type]
    updatedItem.orderInGame = typeLinks.length
    items.value.push(updatedItem)
  } else {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      if (editingItem.value && editingItem.value.type !== updatedItem.type) {
        const newTypeLinks = groupedCompanies.value[updatedItem.type]
        updatedItem.orderInGame = newTypeLinks.length
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
          <DialogTitle>编辑公司</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-4">
            <p
              v-if="items.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无公司，点击下方按钮添加
            </p>
            <template v-else>
              <template
                v-for="type in COMPANY_TYPE_ORDER"
                :key="type"
              >
                <div v-if="groupedCompanies[type].length > 0">
                  <h4 class="text-xs font-medium text-muted-foreground mb-2">
                    {{ COMPANY_TYPE_LABELS[type] }}
                  </h4>
                  <div class="space-y-1">
                    <GameCompaniesItem
                      v-for="(link, index) in groupedCompanies[type]"
                      :key="link.id"
                      :company-name="link.companyName"
                      :note="link.note"
                      :is-spoiler="link.isSpoiler"
                      :spoilers-revealed="spoilersRevealed"
                      :is-first="index === 0"
                      :is-last="index === groupedCompanies[type].length - 1"
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
            添加公司
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
    entity-label="公司关联"
    mode="remove"
    @confirm="deleteId !== null && handleRemove(deleteId)"
  />

  <!-- Company item form dialog -->
  <GameCompaniesItemFormDialog
    v-if="itemFormOpen"
    v-model:open="itemFormOpen"
    :initial-data="itemFormInitialData"
    :exclude-ids="existingCompanyIds"
    @submit="handleItemFormSubmit"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
