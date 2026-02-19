<!--
  CharacterPersonsFormDialog
  Dialog for editing character persons grouped by type.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import { eq, asc } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { characterPersonLinks, type CharacterPersonType } from '@shared/db'
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
import CharacterPersonsItem from './person-item.vue'
import CharacterPersonsItemFormDialog from './person-item-form-dialog.vue'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

interface PersonLinkItem {
  id: string
  personId: string
  personName: string
  type: CharacterPersonType
  note: string
  isSpoiler: boolean
  orderInCharacter: number
  isNew?: boolean
}

const PERSON_TYPE_LABELS: Record<string, string> = {
  actor: '声优',
  illustration: '原画',
  designer: '设计',
  other: '其他'
}

const PERSON_TYPE_ORDER: CharacterPersonType[] = ['actor', 'illustration', 'designer', 'other']

// Form state
const items = ref<PersonLinkItem[]>([])
const editingItem = ref<PersonLinkItem | null>(null)
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

// Fetch character persons when dialog opens
const { data: results, isLoading } = useAsyncData(
  () =>
    db.query.characterPersonLinks.findMany({
      where: eq(characterPersonLinks.characterId, props.characterId),
      with: { person: true },
      orderBy: asc(characterPersonLinks.orderInCharacter)
    }),
  {
    watch: [() => props.characterId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(results, (data) => {
  if (data) {
    items.value = data
      .filter((link) => link.person)
      .map((link) => ({
        id: link.id,
        personId: link.personId,
        personName: link.person!.name,
        type: (link.type || 'other') as CharacterPersonType,
        note: link.note || '',
        isSpoiler: link.isSpoiler,
        orderInCharacter: link.orderInCharacter
      }))
  }
})

// Grouped persons by type
const groupedPersons = computed(() => {
  const grouped: Record<CharacterPersonType, PersonLinkItem[]> = {
    actor: [],
    illustration: [],
    designer: [],
    other: []
  }
  items.value.forEach((item) => {
    grouped[item.type].push(item)
  })
  for (const type of PERSON_TYPE_ORDER) {
    grouped[type].sort((a, b) => a.orderInCharacter - b.orderInCharacter)
  }
  return grouped
})

// Existing person IDs for excluding from select
const existingPersonIds = computed(() => items.value.map((item) => item.personId))

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
    personId: editingItem.value.personId,
    personName: editingItem.value.personName,
    type: editingItem.value.type,
    note: editingItem.value.note,
    isSpoiler: editingItem.value.isSpoiler
  }
})

async function handleSave() {
  isSaving.value = true
  try {
    await db
      .delete(characterPersonLinks)
      .where(eq(characterPersonLinks.characterId, props.characterId))

    if (items.value.length > 0) {
      const linksToInsert: {
        id: string
        characterId: string
        personId: string
        isSpoiler: boolean
        type: CharacterPersonType
        note: string | null
        orderInCharacter: number
      }[] = []

      for (const type of PERSON_TYPE_ORDER) {
        const typeLinks = groupedPersons.value[type]
        typeLinks.forEach((link, index) => {
          linksToInsert.push({
            id: link.isNew ? nanoid() : link.id,
            characterId: props.characterId,
            personId: link.personId,
            isSpoiler: link.isSpoiler,
            type: link.type,
            note: link.note || null,
            orderInCharacter: index
          })
        })
      }

      if (linksToInsert.length > 0) {
        await db.insert(characterPersonLinks).values(linksToInsert)
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

function handleMoveUp(type: CharacterPersonType, index: number) {
  if (index <= 0) return
  const typeLinks = [...groupedPersons.value[type]]
  ;[typeLinks[index - 1], typeLinks[index]] = [typeLinks[index], typeLinks[index - 1]]
  typeLinks.forEach((link, i) => {
    link.orderInCharacter = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleMoveDown(type: CharacterPersonType, index: number) {
  const typeLinks = [...groupedPersons.value[type]]
  if (index >= typeLinks.length - 1) return
  ;[typeLinks[index], typeLinks[index + 1]] = [typeLinks[index + 1], typeLinks[index]]
  typeLinks.forEach((link, i) => {
    link.orderInCharacter = i
  })
  const otherItems = items.value.filter((item) => item.type !== type)
  items.value = [...otherItems, ...typeLinks]
}

function handleRemove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
  deleteId.value = null
}

function handleEdit(item: PersonLinkItem) {
  editingItem.value = { ...item }
  isAddMode.value = false
  itemFormOpen.value = true
}

function handleAddNew() {
  editingItem.value = {
    id: nanoid(),
    personId: '',
    personName: '',
    type: 'actor',
    note: '',
    isSpoiler: false,
    orderInCharacter: items.value.length,
    isNew: true
  }
  isAddMode.value = true
  itemFormOpen.value = true
}

function handleItemFormSubmit(data: {
  personId: string
  personName: string
  type: CharacterPersonType
  note: string
  isSpoiler: boolean
}) {
  const updatedItem: PersonLinkItem = {
    id: editingItem.value!.id,
    personId: data.personId,
    personName: data.personName,
    type: data.type,
    note: data.note,
    isSpoiler: data.isSpoiler,
    orderInCharacter: editingItem.value!.orderInCharacter,
    isNew: editingItem.value!.isNew
  }

  if (isAddMode.value) {
    const typeLinks = groupedPersons.value[updatedItem.type]
    updatedItem.orderInCharacter = typeLinks.length
    items.value.push(updatedItem)
  } else {
    const index = items.value.findIndex((item) => item.id === updatedItem.id)
    if (index !== -1) {
      if (editingItem.value && editingItem.value.type !== updatedItem.type) {
        const newTypeLinks = groupedPersons.value[updatedItem.type]
        updatedItem.orderInCharacter = newTypeLinks.length
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
          <DialogTitle>编辑相关人员</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <div class="space-y-4">
            <p
              v-if="items.length === 0"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无相关人员，点击下方按钮添加
            </p>
            <template v-else>
              <template
                v-for="type in PERSON_TYPE_ORDER"
                :key="type"
              >
                <div v-if="groupedPersons[type].length > 0">
                  <h4 class="text-xs font-medium text-muted-foreground mb-2">
                    {{ PERSON_TYPE_LABELS[type] }}
                  </h4>
                  <div class="space-y-1">
                    <CharacterPersonsItem
                      v-for="(link, index) in groupedPersons[type]"
                      :key="link.id"
                      :person-name="link.personName"
                      :note="link.note"
                      :is-spoiler="link.isSpoiler"
                      :spoilers-revealed="spoilersRevealed"
                      :is-first="index === 0"
                      :is-last="index === groupedPersons[type].length - 1"
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
            添加人员
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
    entity-label="人员关联"
    mode="remove"
    @confirm="deleteId !== null && handleRemove(deleteId)"
  />

  <!-- Person item form dialog -->
  <CharacterPersonsItemFormDialog
    v-if="itemFormOpen"
    v-model:open="itemFormOpen"
    :initial-data="itemFormInitialData"
    :exclude-ids="existingPersonIds"
    @submit="handleItemFormSubmit"
  />

  <SpoilerConfirmDialog
    v-if="spoilerConfirmOpen"
    v-model:open="spoilerConfirmOpen"
    @confirm="handleRevealSpoilersConfirm"
  />
</template>
