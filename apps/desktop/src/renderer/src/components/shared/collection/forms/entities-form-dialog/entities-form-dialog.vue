<!--
  CollectionEntitiesFormDialog

  Dialog for editing entities in a collection.
  Supports all entity types (game, character, person, company).
  Features inline add/edit dialog with note field and reordering.
-->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import {
  collectionGameLinks,
  collectionCharacterLinks,
  collectionPersonLinks,
  collectionCompanyLinks
} from '@shared/db'
import { useAsyncData, useRenderState } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@renderer/components/ui/segmented-control'
import { Spinner } from '@renderer/components/ui/spinner'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import CollectionEntitiesItem from './entity-item.vue'
import CollectionEntitiesItemFormDialog from './entity-item-form-dialog.vue'
import { type ContentEntityType, CONTENT_ENTITY_TYPES } from '@shared/common'

interface EntityLink {
  id: string
  entityId: string
  entityName: string
  entityType: ContentEntityType
  note: string
  orderInCollection: number
  isNew?: boolean
}

interface EntityConfig {
  label: string
  unitLabel: string
}

const ENTITY_CONFIG: Record<ContentEntityType, EntityConfig> = {
  game: { label: '游戏', unitLabel: '款' },
  character: { label: '角色', unitLabel: '个' },
  person: { label: '人物', unitLabel: '位' },
  company: { label: '公司', unitLabel: '家' }
}

interface Props {
  collectionId: string
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

// State
const entityLinks = ref<EntityLink[]>([])
const currentEntityType = ref<ContentEntityType>('game')
const formOpen = ref(false)
const editingItem = ref<EntityLink | null>(null)
const isAddMode = ref(false)
const deleteId = ref<string | null>(null)
const isSaving = ref(false)

// Fetch data
const {
  data: fetchedLinks,
  isLoading,
  error,
  refetch
} = useAsyncData(
  async () => {
    const [gameLinks, characterLinks, personLinks, companyLinks] = await Promise.all([
      db.query.collectionGameLinks.findMany({
        where: eq(collectionGameLinks.collectionId, props.collectionId),
        with: { game: true },
        orderBy: asc(collectionGameLinks.orderInCollection)
      }),
      db.query.collectionCharacterLinks.findMany({
        where: eq(collectionCharacterLinks.collectionId, props.collectionId),
        with: { character: true },
        orderBy: asc(collectionCharacterLinks.orderInCollection)
      }),
      db.query.collectionPersonLinks.findMany({
        where: eq(collectionPersonLinks.collectionId, props.collectionId),
        with: { person: true },
        orderBy: asc(collectionPersonLinks.orderInCollection)
      }),
      db.query.collectionCompanyLinks.findMany({
        where: eq(collectionCompanyLinks.collectionId, props.collectionId),
        with: { company: true },
        orderBy: asc(collectionCompanyLinks.orderInCollection)
      })
    ])

    return [
      ...gameLinks.map((link) => ({
        id: link.id,
        entityId: link.gameId,
        entityName: link.game?.name || 'Unknown',
        entityType: 'game' as ContentEntityType,
        note: link.note || '',
        orderInCollection: link.orderInCollection
      })),
      ...characterLinks.map((link) => ({
        id: link.id,
        entityId: link.characterId,
        entityName: link.character?.name || 'Unknown',
        entityType: 'character' as ContentEntityType,
        note: link.note || '',
        orderInCollection: link.orderInCollection
      })),
      ...personLinks.map((link) => ({
        id: link.id,
        entityId: link.personId,
        entityName: link.person?.name || 'Unknown',
        entityType: 'person' as ContentEntityType,
        note: link.note || '',
        orderInCollection: link.orderInCollection
      })),
      ...companyLinks.map((link) => ({
        id: link.id,
        entityId: link.companyId,
        entityName: link.company?.name || 'Unknown',
        entityType: 'company' as ContentEntityType,
        note: link.note || '',
        orderInCollection: link.orderInCollection
      }))
    ]
  },
  {
    watch: [() => props.collectionId],
    enabled: () => open.value
  }
)
const state = useRenderState(isLoading, error, fetchedLinks)

// Initialize form state when data loads
watch(fetchedLinks, (links) => {
  if (links) {
    entityLinks.value = links
  }
})

// Reset when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      refetch()
    }
  },
  { immediate: true }
)

// Computed
const currentTypeLinks = computed(() =>
  entityLinks.value
    .filter((l) => l.entityType === currentEntityType.value)
    .sort((a, b) => a.orderInCollection - b.orderInCollection)
)

const existingEntityIds = computed(() => currentTypeLinks.value.map((l) => l.entityId))

const config = computed(() => ENTITY_CONFIG[currentEntityType.value])

const entityCounts = computed(() =>
  CONTENT_ENTITY_TYPES.reduce(
    (acc, type) => {
      acc[type] = entityLinks.value.filter((l) => l.entityType === type).length
      return acc
    },
    {} as Record<ContentEntityType, number>
  )
)

const hasAnyItems = computed(() => currentTypeLinks.value.length > 0)

// Handlers
function handleAddClick() {
  editingItem.value = null
  isAddMode.value = true
  formOpen.value = true
}

function handleEditClick(item: EntityLink) {
  editingItem.value = item
  isAddMode.value = false
  formOpen.value = true
}

function handleFormSubmit(data: EntityLink) {
  if (isAddMode.value) {
    const newOrder = currentTypeLinks.value.length
    entityLinks.value = [...entityLinks.value, { ...data, orderInCollection: newOrder }]
  } else {
    entityLinks.value = entityLinks.value.map((l) => (l.id === data.id ? data : l))
  }
  formOpen.value = false
}

function handleDelete() {
  if (deleteId.value) {
    entityLinks.value = entityLinks.value.filter((l) => l.id !== deleteId.value)
    deleteId.value = null
  }
}

function handleMoveUp(index: number) {
  if (index === 0) return
  const typeLinks = [...currentTypeLinks.value]
  ;[typeLinks[index - 1], typeLinks[index]] = [typeLinks[index], typeLinks[index - 1]]
  typeLinks.forEach((link, i) => {
    link.orderInCollection = i
  })
  const otherLinks = entityLinks.value.filter((l) => l.entityType !== currentEntityType.value)
  entityLinks.value = [...otherLinks, ...typeLinks]
}

function handleMoveDown(index: number) {
  if (index >= currentTypeLinks.value.length - 1) return
  const typeLinks = [...currentTypeLinks.value]
  ;[typeLinks[index], typeLinks[index + 1]] = [typeLinks[index + 1], typeLinks[index]]
  typeLinks.forEach((link, i) => {
    link.orderInCollection = i
  })
  const otherLinks = entityLinks.value.filter((l) => l.entityType !== currentEntityType.value)
  entityLinks.value = [...otherLinks, ...typeLinks]
}

async function handleSave() {
  isSaving.value = true
  try {
    // Delete all existing links
    await Promise.all([
      db
        .delete(collectionGameLinks)
        .where(eq(collectionGameLinks.collectionId, props.collectionId)),
      db
        .delete(collectionCharacterLinks)
        .where(eq(collectionCharacterLinks.collectionId, props.collectionId)),
      db
        .delete(collectionPersonLinks)
        .where(eq(collectionPersonLinks.collectionId, props.collectionId)),
      db
        .delete(collectionCompanyLinks)
        .where(eq(collectionCompanyLinks.collectionId, props.collectionId))
    ])

    // Prepare links to insert
    const gameLinksToInsert = entityLinks.value
      .filter((l) => l.entityType === 'game')
      .sort((a, b) => a.orderInCollection - b.orderInCollection)
      .map((l, index) => ({
        id: l.isNew ? nanoid() : l.id,
        collectionId: props.collectionId,
        gameId: l.entityId,
        note: l.note || null,
        orderInCollection: index
      }))
    const characterLinksToInsert = entityLinks.value
      .filter((l) => l.entityType === 'character')
      .sort((a, b) => a.orderInCollection - b.orderInCollection)
      .map((l, index) => ({
        id: l.isNew ? nanoid() : l.id,
        collectionId: props.collectionId,
        characterId: l.entityId,
        note: l.note || null,
        orderInCollection: index
      }))
    const personLinksToInsert = entityLinks.value
      .filter((l) => l.entityType === 'person')
      .sort((a, b) => a.orderInCollection - b.orderInCollection)
      .map((l, index) => ({
        id: l.isNew ? nanoid() : l.id,
        collectionId: props.collectionId,
        personId: l.entityId,
        note: l.note || null,
        orderInCollection: index
      }))
    const companyLinksToInsert = entityLinks.value
      .filter((l) => l.entityType === 'company')
      .sort((a, b) => a.orderInCollection - b.orderInCollection)
      .map((l, index) => ({
        id: l.isNew ? nanoid() : l.id,
        collectionId: props.collectionId,
        companyId: l.entityId,
        note: l.note || null,
        orderInCollection: index
      }))

    // Insert new links
    if (gameLinksToInsert.length > 0) {
      await db.insert(collectionGameLinks).values(gameLinksToInsert)
    }
    if (characterLinksToInsert.length > 0) {
      await db.insert(collectionCharacterLinks).values(characterLinksToInsert)
    }
    if (personLinksToInsert.length > 0) {
      await db.insert(collectionPersonLinks).values(personLinksToInsert)
    }
    if (companyLinksToInsert.length > 0) {
      await db.insert(collectionCompanyLinks).values(companyLinksToInsert)
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

// Delete dialog computed
const deleteDialogOpen = computed({
  get: () => deleteId.value !== null,
  set: (value) => {
    if (!value) deleteId.value = null
  }
})

const formOpenComputed = computed({
  get: () => formOpen.value,
  set: (value) => {
    formOpen.value = value
  }
})

// Computed model for entity type tabs (SegmentedControl returns string | undefined)
const entityTypeModel = computed({
  get: () => currentEntityType.value,
  set: (v: string | undefined) => {
    if (v) currentEntityType.value = v as ContentEntityType
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <!-- Loading state -->
      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>编辑合集内容</DialogTitle>
        </DialogHeader>
        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <!-- Entity type tabs -->
          <SegmentedControl
            v-model="entityTypeModel"
            class="mb-4"
          >
            <SegmentedControlItem
              v-for="type in CONTENT_ENTITY_TYPES"
              :key="type"
              :value="type"
              class="flex-1 gap-1"
            >
              {{ ENTITY_CONFIG[type].label }}
              <span
                v-if="entityCounts[type] > 0"
                class="text-[10px] text-muted-foreground"
              >
                ({{ entityCounts[type] }})
              </span>
            </SegmentedControlItem>
          </SegmentedControl>

          <!-- Entity list -->
          <div class="space-y-1">
            <div
              v-if="!hasAnyItems"
              class="text-sm text-muted-foreground text-center py-8"
            >
              暂无{{ config.label }}，点击下方按钮添加
            </div>
            <CollectionEntitiesItem
              v-for="(link, index) in currentTypeLinks"
              :key="link.id"
              :link="link"
              :index="index"
              :total-count="currentTypeLinks.length"
              @edit="handleEditClick(link)"
              @delete="deleteId = link.id"
              @move-up="handleMoveUp(index)"
              @move-down="handleMoveDown(index)"
            />
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
            添加{{ config.label }}
          </Button>
          <div class="flex gap-2">
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
              {{ isSaving ? '保存中...' : '保存' }}
            </Button>
          </div>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>

  <!-- Delete confirmation -->
  <DeleteConfirmDialog
    v-if="deleteId"
    v-model:open="deleteDialogOpen"
    entity-label="项目"
    mode="remove"
    @confirm="handleDelete"
  />

  <!-- Add/Edit form dialog -->
  <CollectionEntitiesItemFormDialog
    v-if="formOpen"
    v-model:open="formOpenComputed"
    :entity-type="currentEntityType"
    :initial-data="editingItem ?? undefined"
    :existing-entity-ids="existingEntityIds"
    :is-add-mode="isAddMode"
    @submit="handleFormSubmit"
  />
</template>
