<!--
  LibraryShowcaseSectionItemFormDialog - Form dialog for editing a single section
  Used inline within SectionsFormDialog.
  Filter configuration opens in a separate nested dialog.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import {
  FilterDialog,
  gameFilterUiSpec,
  characterFilterUiSpec,
  personFilterUiSpec,
  companyFilterUiSpec,
  collectionFilterUiSpec,
  tagFilterUiSpec
} from '@renderer/components/shared/filter'
import { createEmptyFilter, countActiveFilters, type FilterState } from '@shared/filter'
import { notify } from '@renderer/core/notify'
import type {
  ShowcaseSectionFormItem,
  SectionLayout,
  SectionItemSize,
  SectionOpenMode,
  SortDirection
} from '@shared/db'
import type { AllEntityType } from '@shared/common'

// =============================================================================
// Constants
// =============================================================================

const ENTITY_TYPES: { value: AllEntityType; label: string }[] = [
  { value: 'game', label: '游戏' },
  { value: 'character', label: '角色' },
  { value: 'person', label: '人物' },
  { value: 'company', label: '公司' },
  { value: 'collection', label: '合集' },
  { value: 'tag', label: '标签' }
]

const LAYOUTS = [
  { value: 'horizontal', label: '横向滚动' },
  { value: 'grid', label: '网格' }
]

const ITEM_SIZES = [
  { value: 'xs', label: '超小' },
  { value: 'sm', label: '小' },
  { value: 'md', label: '中' },
  { value: 'lg', label: '大' },
  { value: 'xl', label: '超大' }
]

const SORT_DIRECTIONS = [
  { value: 'asc', label: '升序' },
  { value: 'desc', label: '降序' }
]

const OPEN_MODES: { value: SectionOpenMode; label: string }[] = [
  { value: 'page', label: '页面' },
  { value: 'dialog', label: '弹窗' }
]

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  item: ShowcaseSectionFormItem | null
  isNew: boolean
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  save: [item: ShowcaseSectionFormItem]
  cancel: []
}>()

// =============================================================================
// Form State
// =============================================================================

interface ShowcaseSectionItemFormData {
  name: string
  entityType: AllEntityType
  layout: SectionLayout
  itemSize: SectionItemSize
  openMode: SectionOpenMode
  limit: string
  filter: FilterState
  sortField: string
  sortDirection: SortDirection
}

const formData = ref<ShowcaseSectionItemFormData>({
  name: '',
  entityType: 'game',
  layout: 'horizontal',
  itemSize: 'md',
  openMode: 'page',
  limit: '',
  filter: createEmptyFilter(),
  sortField: 'name',
  sortDirection: 'asc'
})
const isFilterDialogOpen = ref(false)

// Initialize form when dialog opens or item changes
watch(
  [open, () => props.item],
  ([isOpen, item]) => {
    if (isOpen && item) {
      formData.value.name = item.name
      formData.value.entityType = item.entityType
      formData.value.layout = item.layout
      formData.value.itemSize = item.itemSize
      formData.value.openMode = item.openMode
      formData.value.limit = item.limit?.toString() || ''
      formData.value.filter = item.filter
      formData.value.sortField = item.sortField
      formData.value.sortDirection = item.sortDirection
    }
  },
  { immediate: true }
)

// =============================================================================
// Computed
// =============================================================================

const uiSpec = computed(() => getUiSpec(formData.value.entityType))
const sortFields = computed(() => uiSpec.value.sortOptions)
const activeFilterCount = computed(() => countActiveFilters(formData.value.filter))

// Watch for entity type changes - update sort field and reset filter
watch(
  () => formData.value.entityType,
  (newEntityType, oldEntityType) => {
    // Update sort field if current one is not available for new entity type
    const fields = getUiSpec(newEntityType).sortOptions
    if (!fields.find((f) => f.key === formData.value.sortField)) {
      formData.value.sortField = 'name'
    }

    // Reset filter when entity type changes (since fields are different)
    if (props.item && oldEntityType !== newEntityType) {
      formData.value.filter = createEmptyFilter()
    }
  }
)

function getUiSpec(entityType: AllEntityType) {
  switch (entityType) {
    case 'game':
      return gameFilterUiSpec
    case 'character':
      return characterFilterUiSpec
    case 'person':
      return personFilterUiSpec
    case 'company':
      return companyFilterUiSpec
    case 'collection':
      return collectionFilterUiSpec
    case 'tag':
      return tagFilterUiSpec
  }
}

// =============================================================================
// Handlers
// =============================================================================

function handleSubmit() {
  if (!formData.value.name.trim()) {
    notify.error('请输入区块标题')
    return
  }

  if (!props.item) return

  emit('save', {
    ...props.item,
    name: formData.value.name.trim(),
    entityType: formData.value.entityType,
    layout: formData.value.layout,
    itemSize: formData.value.itemSize,
    openMode: formData.value.openMode,
    limit: formData.value.limit ? parseInt(formData.value.limit, 10) : null,
    filter: formData.value.filter,
    sortField: formData.value.sortField,
    sortDirection: formData.value.sortDirection
  })
}

function handleCancel() {
  emit('cancel')
  open.value = false
}

// Call handleCancel when dialog is closed externally
watch(open, (newOpen, oldOpen) => {
  if (oldOpen && !newOpen) {
    emit('cancel')
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ props.isNew ? '添加区块' : '编辑区块' }}</DialogTitle>
      </DialogHeader>

      <Form @submit="handleSubmit">
        <DialogBody>
          <FieldGroup>
            <!-- Title -->
            <Field>
              <FieldLabel>标题</FieldLabel>
              <FieldContent>
                <Input
                  v-model="formData.name"
                  placeholder="输入区块标题..."
                />
              </FieldContent>
            </Field>

            <!-- Entity Type & Layout -->
            <div class="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>实体类型</FieldLabel>
                <FieldContent>
                  <Select v-model="formData.entityType">
                    <SelectTrigger class="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="t in ENTITY_TYPES"
                        :key="t.value"
                        :value="t.value"
                      >
                        {{ t.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>布局</FieldLabel>
                <FieldContent>
                  <Select v-model="formData.layout">
                    <SelectTrigger class="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="l in LAYOUTS"
                        :key="l.value"
                        :value="l.value"
                      >
                        {{ l.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </div>

            <!-- Open Mode -->
            <Field>
              <FieldLabel>打开方式</FieldLabel>
              <FieldContent>
                <Select v-model="formData.openMode">
                  <SelectTrigger class="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="m in OPEN_MODES"
                      :key="m.value"
                      :value="m.value"
                    >
                      {{ m.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <!-- Size & Limit -->
            <div class="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>卡片大小</FieldLabel>
                <FieldContent>
                  <Select v-model="formData.itemSize">
                    <SelectTrigger class="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="s in ITEM_SIZES"
                        :key="s.value"
                        :value="s.value"
                      >
                        {{ s.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>显示数量</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.limit"
                    type="number"
                    placeholder="不限"
                    min="1"
                  />
                </FieldContent>
              </Field>
            </div>

            <!-- Sort -->
            <Field>
              <FieldLabel>排序</FieldLabel>
              <FieldContent>
                <div class="flex gap-2">
                  <Select v-model="formData.sortField">
                    <SelectTrigger class="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="f in sortFields"
                        :key="f.key"
                        :value="f.key"
                      >
                        {{ f.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select v-model="formData.sortDirection">
                    <SelectTrigger class="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="d in SORT_DIRECTIONS"
                        :key="d.value"
                        :value="d.value"
                      >
                        {{ d.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FieldContent>
            </Field>

            <!-- Filter Button -->
            <Field>
              <FieldLabel>筛选条件</FieldLabel>
              <FieldContent>
                <Button
                  type="button"
                  variant="outline"
                  class="w-full justify-start"
                  @click="isFilterDialogOpen = true"
                >
                  <span class="icon-[mdi--filter-outline] size-4 mr-2 text-muted-foreground" />
                  <template v-if="activeFilterCount > 0">
                    已设置 <span class="text-primary">{{ activeFilterCount }}</span> 个条件
                  </template>
                  <template v-else>
                    <span class="text-muted-foreground">点击设置筛选条件...</span>
                  </template>
                </Button>
              </FieldContent>
            </Field>
          </FieldGroup>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            取消
          </Button>
          <Button type="submit">确定</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>

  <!-- Nested Filter Dialog -->
  <FilterDialog
    v-if="isFilterDialogOpen"
    v-model:open="isFilterDialogOpen"
    v-model="formData.filter"
    :ui-spec="uiSpec"
  />
</template>
