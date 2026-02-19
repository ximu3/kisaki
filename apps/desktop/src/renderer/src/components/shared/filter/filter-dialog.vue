<!--
  FilterDialog
  Dialog-based filter panel.
  Full-screen dialog version of FilterPanel.
  Has header with title/count, scrollable body, and footer with clear/cancel/confirm.
-->
<script setup lang="ts">
import type { FilterState } from '@shared/filter'
import { ref, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { createEmptyFilter, countActiveFilters } from '@shared/filter'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Form } from '@renderer/components/ui/form'
import { Button } from '@renderer/components/ui/button'
import FilterBuilder from './filter-builder.vue'
import type { FilterUiSpec } from './specs/types'

interface Props {
  uiSpec: FilterUiSpec
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })
const filterModel = defineModel<FilterState>({ required: true })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Local filter state - initialized in watch
const localFilter = ref<FilterState>(createEmptyFilter())

// Reset local filter when dialog opens (including initial)
watch(
  open,
  (isOpen) => {
    if (isOpen) {
      localFilter.value = filterModel.value
    }
  },
  { immediate: true }
)

function handleClear() {
  localFilter.value = createEmptyFilter()
}

function handleConfirm() {
  filterModel.value = localFilter.value
  emit('confirm')
  open.value = false
}

function handleCancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <Form @submit="handleConfirm">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Icon
              icon="icon-[mdi--filter-outline]"
              class="size-4"
            />
            筛选条件
            <span
              v-if="countActiveFilters(localFilter) > 0"
              class="text-sm font-normal text-muted-foreground"
            >
              {{ countActiveFilters(localFilter) }} 个条件
            </span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody class="overflow-auto max-h-[60vh] scrollbar-thin">
          <FilterBuilder
            v-model="localFilter"
            :ui-spec="props.uiSpec"
          />
        </DialogBody>

        <DialogFooter class="flex-row justify-between items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-muted-foreground"
            @click="handleClear"
          >
            <Icon
              icon="icon-[mdi--filter-off-outline]"
              class="size-4 mr-1.5"
            />
            清除筛选
          </Button>
          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              @click="handleCancel"
            >
              取消
            </Button>
            <Button type="submit"> 确认 </Button>
          </div>
        </DialogFooter>
      </Form>
    </DialogContent>
  </Dialog>
</template>
