<!--
  LibraryShowcaseSectionsItem - Single section item in the sections list
  Displays section info with action buttons for reordering, visibility toggle, edit, and delete.
-->
<script setup lang="ts">
import { Button } from '@renderer/components/ui/button'
import { cn, getEntityIcon } from '@renderer/utils'
import type { AllEntityType } from '@shared/common'
import type { ShowcaseSectionFormItem } from '@shared/db'

// =============================================================================
// Constants
// =============================================================================

const LAYOUT_LABELS: Record<string, string> = {
  horizontal: '横向滚动',
  grid: '网格'
}

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  item: ShowcaseSectionFormItem
  index: number
  isFirst: boolean
  isLast: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  toggleVisibility: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div
    :class="
      cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group',
        !props.item.isVisible && 'opacity-50'
      )
    "
  >
    <div class="shrink-0 size-10 rounded-md bg-muted flex items-center justify-center">
          <span
        :class="
          cn(
            'size-5 text-muted-foreground',
            getEntityIcon(props.item.entityType as AllEntityType) || 'icon-[mdi--view-grid]'
          )
        "
      />
    </div>
    <div class="flex-1 min-w-0 flex flex-col">
      <div class="text-sm font-medium truncate">{{ props.item.name || '未命名' }}</div>
      <div class="text-xs text-muted-foreground flex items-center gap-1">
        {{ LAYOUT_LABELS[props.item.layout] || props.item.layout }}
      </div>
    </div>

    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="props.isFirst"
        class="size-7"
        title="上移"
        @click="emit('moveUp')"
      >
        <span class="icon-[mdi--arrow-up] size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="props.isLast"
        class="size-7"
        title="下移"
        @click="emit('moveDown')"
      >
        <span class="icon-[mdi--arrow-down] size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :title="props.item.isVisible ? '隐藏' : '显示'"
        @click="emit('toggleVisibility')"
      >
        <span
          :class="
            cn(
              'size-4',
              props.item.isVisible ? 'icon-[mdi--eye-outline]' : 'icon-[mdi--eye-off-outline]'
            )
          "
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        title="编辑"
        @click="emit('edit')"
      >
        <span class="icon-[mdi--pencil-outline] size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7 text-destructive hover:text-destructive"
        title="删除"
        @click="emit('delete')"
      >
        <span class="icon-[mdi--delete-outline] size-4" />
      </Button>
    </div>
  </div>
</template>
