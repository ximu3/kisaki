<!--
  CollectionDynamicConfigFormDialog

  Dialog for configuring dynamic collection filters.
  All 4 entity types are always shown with filter/sort controls visible.
  Checkbox toggles whether the type is included in the collection.
-->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import {
  FilterDialog,
  gameFilterUiSpec,
  characterFilterUiSpec,
  personFilterUiSpec,
  companyFilterUiSpec
} from '@renderer/components/shared/filter'
import { useAsyncData } from '@renderer/composables'
import { cn, getEntityIcon } from '@renderer/utils'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { createEmptyFilter, countActiveFilters } from '@shared/filter'
import type { FilterState } from '@shared/filter'
import { collections, type DynamicCollectionConfig, type DynamicEntityConfig } from '@shared/db'
import type { ContentEntityType, SortDirection } from '@shared/common'
import { CONTENT_ENTITY_TYPES } from '@shared/common'

interface Props {
  collectionId: string
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  updated: [config: DynamicCollectionConfig]
}>()

interface EntityTypeConfig {
  label: string
}

const ENTITY_TYPE_CONFIG: Record<ContentEntityType, EntityTypeConfig> = {
  game: { label: '游戏' },
  character: { label: '角色' },
  person: { label: '人物' },
  company: { label: '公司' }
}

function createDefaultEntityConfig(): DynamicEntityConfig {
  return {
    enabled: false,
    filter: createEmptyFilter(),
    sortField: 'name',
    sortDirection: 'asc'
  }
}

function createDefaultConfig(): DynamicCollectionConfig {
  return {
    game: createDefaultEntityConfig(),
    character: createDefaultEntityConfig(),
    person: createDefaultEntityConfig(),
    company: createDefaultEntityConfig()
  }
}

function normalizeConfig(value: DynamicCollectionConfig | null | undefined): DynamicCollectionConfig {
  const v = value ?? null
  return {
    game: v?.game ?? createDefaultEntityConfig(),
    character: v?.character ?? createDefaultEntityConfig(),
    person: v?.person ?? createDefaultEntityConfig(),
    company: v?.company ?? createDefaultEntityConfig()
  }
}

// Local config state
const localConfig = ref<DynamicCollectionConfig>(createDefaultConfig())
const initialized = ref(false)
const isSubmitting = ref(false)

const { data: existingCollection, refetch } = useAsyncData(
  async () => {
    const data = await db.query.collections.findFirst({
      where: eq(collections.id, props.collectionId)
    })
    return data ?? null
  },
  {
    watch: [() => props.collectionId],
    enabled: () => open.value
  }
)

// Filter dialog state
const filterDialogEntityType = ref<ContentEntityType | null>(null)
const filterDialogOpen = computed({
  get: () => filterDialogEntityType.value !== null,
  set: (value) => {
    if (!value) filterDialogEntityType.value = null
  }
})

const filterDialogUiSpec = computed(() =>
  filterDialogEntityType.value ? getUiSpec(filterDialogEntityType.value) : null
)

// Computed for current entity filter (for FilterDialog v-model)
const currentEntityFilter = computed({
  get: () =>
    filterDialogEntityType.value
      ? localConfig.value[filterDialogEntityType.value].filter
      : createEmptyFilter(),
  set: (filter: FilterState) => {
    if (filterDialogEntityType.value) {
      updateEntityConfig(filterDialogEntityType.value, { filter })
    }
  }
})

function getUiSpec(entityType: ContentEntityType) {
  switch (entityType) {
    case 'game':
      return gameFilterUiSpec
    case 'character':
      return characterFilterUiSpec
    case 'person':
      return personFilterUiSpec
    case 'company':
      return companyFilterUiSpec
  }
}

function getSortOptions(type: ContentEntityType) {
  return getUiSpec(type).sortOptions
}

// Initialize config when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      initialized.value = false
      refetch()
    }
  },
  { immediate: true }
)

watch(existingCollection, (data) => {
  if (!open.value) return
  if (initialized.value) return
  localConfig.value = normalizeConfig((data?.dynamicConfig as DynamicCollectionConfig | null) ?? null)
  initialized.value = true
})

function toggleEntity(type: ContentEntityType) {
  localConfig.value = {
    ...localConfig.value,
    [type]: { ...localConfig.value[type], enabled: !localConfig.value[type].enabled }
  }
}

// Helper to create checked model for entity enabled state
function createEntityEnabledModel(type: ContentEntityType) {
  return computed({
    get: () => localConfig.value[type].enabled,
    set: () => toggleEntity(type)
  })
}

// Pre-create enabled models for all entity types
const entityEnabledModels = {
  game: createEntityEnabledModel('game'),
  character: createEntityEnabledModel('character'),
  person: createEntityEnabledModel('person'),
  company: createEntityEnabledModel('company')
}

function updateEntityConfig(type: ContentEntityType, updates: Partial<DynamicEntityConfig>) {
  localConfig.value = {
    ...localConfig.value,
    [type]: { ...localConfig.value[type], ...updates }
  }
}

function openFilterDialog(type: ContentEntityType) {
  filterDialogEntityType.value = type
}

function handleConfirm() {
  void (async () => {
    if (isSubmitting.value) return
    isSubmitting.value = true
    try {
      await db
        .update(collections)
        .set({ dynamicConfig: localConfig.value })
        .where(eq(collections.id, props.collectionId))
      notify.success('筛选配置已更新')
      emit('updated', localConfig.value)
      open.value = false
    } catch (error) {
      console.error('Failed to update filter config:', error)
      notify.error('更新失败')
    } finally {
      isSubmitting.value = false
    }
  })()
}

const enabledCount = computed(
  () => CONTENT_ENTITY_TYPES.filter((t) => localConfig.value[t].enabled).length
)

// Helper to create computed models for each entity type's sort field and direction
function createSortFieldModel(type: ContentEntityType) {
  return computed({
    get: () => localConfig.value[type].sortField,
    set: (v: string) => updateEntityConfig(type, { sortField: v })
  })
}

function createSortDirectionModel(type: ContentEntityType) {
  return computed({
    get: () => localConfig.value[type].sortDirection,
    set: (v: string) => updateEntityConfig(type, { sortDirection: v as SortDirection })
  })
}

// Pre-create computed models for all entity types
const sortFieldModels = {
  game: createSortFieldModel('game'),
  character: createSortFieldModel('character'),
  person: createSortFieldModel('person'),
  company: createSortFieldModel('company')
}

const sortDirectionModels = {
  game: createSortDirectionModel('game'),
  character: createSortDirectionModel('character'),
  person: createSortDirectionModel('person'),
  company: createSortDirectionModel('company')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Icon
            icon="icon-[mdi--filter-outline]"
            class="size-5"
          />
          动态筛选配置
          <span
            v-if="enabledCount > 0"
            class="text-sm font-normal text-muted-foreground"
          >
            已启用 {{ enabledCount }} 个类型
          </span>
        </DialogTitle>
      </DialogHeader>

      <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
        <div class="space-y-2">
          <div
            v-for="type in CONTENT_ENTITY_TYPES"
            :key="type"
            :class="
              cn(
                'rounded-lg border p-3 transition-colors',
                localConfig[type].enabled ? 'bg-card border-primary/30' : 'bg-card border-border'
              )
            "
          >
            <!-- Header row with checkbox and entity info -->
            <div class="flex items-center gap-3">
              <Checkbox
                v-model="entityEnabledModels[type].value"
                class="shrink-0"
              />
              <div
                :class="
                  cn(
                    'size-9 rounded-md flex items-center justify-center transition-colors',
                    localConfig[type].enabled ? 'bg-primary/10' : 'bg-muted'
                  )
                "
              >
                <Icon
                  :icon="getEntityIcon(type)"
                  :class="
                    cn(
                      'size-4',
                      localConfig[type].enabled ? 'text-primary' : 'text-muted-foreground'
                    )
                  "
                />
              </div>
              <span
                :class="
                  cn('font-medium text-sm', !localConfig[type].enabled && 'text-muted-foreground')
                "
              >
                {{ ENTITY_TYPE_CONFIG[type].label }}
              </span>
            </div>

            <!-- Config row - always visible and fully interactive -->
            <div class="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
              <!-- Filter button -->
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="h-7 text-xs"
                @click="openFilterDialog(type)"
              >
                <Icon
                  icon="icon-[mdi--filter-outline]"
                  class="size-3.5 mr-1"
                />
                筛选
                <span
                  v-if="countActiveFilters(localConfig[type].filter) > 0"
                  class="ml-1 text-muted-foreground leading-0"
                >
                  ({{ countActiveFilters(localConfig[type].filter) }})
                </span>
              </Button>

              <div class="flex-1" />

              <!-- Sort controls -->
              <span class="text-xs text-muted-foreground">排序:</span>
              <Select v-model="sortFieldModels[type].value">
                <SelectTrigger class="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="field in getSortOptions(type)"
                    :key="field.key"
                    :value="field.key"
                  >
                    {{ field.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select v-model="sortDirectionModels[type].value">
                <SelectTrigger class="w-16 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序</SelectItem>
                  <SelectItem value="desc">降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Explanatory note -->
          <p class="text-xs text-muted-foreground mt-3 px-1 flex items-center">
            <Icon
              icon="icon-[mdi--information-outline]"
              class="size-3.5 mr-1 shrink-0"
            />
            已启用但未设置筛选条件的类型将包含该类型的全部项目
          </p>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isSubmitting"
          @click="open = false"
        >
          取消
        </Button>
        <Button
          :disabled="isSubmitting || !initialized"
          @click="handleConfirm"
        >
          确认
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Filter dialog for each entity type -->
  <FilterDialog
    v-if="filterDialogEntityType"
    v-model:open="filterDialogOpen"
    v-model="currentEntityFilter"
    :ui-spec="filterDialogUiSpec!"
  />
</template>
