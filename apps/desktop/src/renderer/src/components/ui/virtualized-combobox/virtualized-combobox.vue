<!--
  VirtualizedCombobox - A virtualized combobox component for selecting entities

  Features:
  - Virtual scrolling using TanStack Vue Virtual for large lists
  - Single/multiple selection modes
  - Create new item option (fixed at bottom with border)
  - Avatar support for entities
  - Keyboard navigation support
-->
<script setup lang="ts">
import { computed, ref, nextTick, type HTMLAttributes } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { Popover, PopoverTrigger, PopoverContent } from '@renderer/components/ui/popover'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'
import type { VirtualizedComboboxEntity } from './types'

interface Props {
  /** Entity list to select from */
  entities: VirtualizedComboboxEntity[]
  /** Currently selected entity IDs */
  selectedIds: string[]
  /** Search placeholder text */
  placeholder?: string
  /** Text shown when nothing is selected */
  emptyText?: string
  /** Enable multiple selection */
  multiple?: boolean
  /** Custom class name for the trigger button */
  class?: HTMLAttributes['class']
  /** Disable the combobox */
  disabled?: boolean
  /** Popover max height in pixels */
  maxHeight?: number
  /** Allow creating new items */
  allowCreate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索...',
  emptyText: '选择...',
  multiple: false,
  disabled: false,
  maxHeight: 230,
  allowCreate: false
})

const emit = defineEmits<{
  /** Callback when selection changes */
  'update:selectedIds': [ids: string[]]
  /** Callback when creating a new item, receives search value */
  create: [value: string]
}>()

const open = ref(false)
const search = ref('')
// -1 = no focus, 0..n = entity index, 'create' = create button
const focusedIndex = ref<number | 'create'>(-1)
const isKeyboardNavActive = ref(false)
const parentRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const selectedIdsSet = computed(() => new Set(props.selectedIds))

// Case-insensitive search helper
function contains(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase())
}

const filteredEntities = computed(() => {
  if (!search.value) return props.entities
  return props.entities.filter(
    (e) => contains(e.name, search.value) || (e.subText && contains(e.subText, search.value))
  )
})

// Check if can create new item (only when no exact match exists)
const canCreate = computed(() => {
  if (!props.allowCreate || !search.value.trim()) return false
  const lowerSearch = search.value.toLowerCase().trim()
  return !props.entities.some(
    (e) =>
      e.id.toLowerCase() === lowerSearch ||
      e.name.toLowerCase() === lowerSearch ||
      e.subText?.toLowerCase() === lowerSearch
  )
})

// Check if any entity has subText to determine item height
const hasSubText = computed(() => props.entities.some((e) => e.subText))
const hasImage = computed(() => props.entities.some((e) => e.imageUrl !== undefined))

const ITEM_HEIGHT = 26
const ITEM_HEIGHT_WITH_SUBTEXT = 44

const itemHeight = computed(() =>
  hasSubText.value || hasImage.value ? ITEM_HEIGHT_WITH_SUBTEXT : ITEM_HEIGHT
)

// Setup TanStack Virtual
const virtualizer = useVirtualizer(
  computed(() => ({
    count: filteredEntities.value.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => itemHeight.value,
    overscan: 3
  }))
)

// Display text for trigger button
const displayText = computed(() => {
  const entities = props.entities
  const selectedIds = props.selectedIds

  if (selectedIds.length === 0) return null
  if (props.multiple) {
    return `已选择 ${selectedIds.length} 项`
  }
  const selected = entities.find((e) => e.id === selectedIds[0])
  return selected?.name ?? null
})

function handleSelect(id: string) {
  if (props.multiple) {
    // Toggle selection in multiple mode
    if (selectedIdsSet.value.has(id)) {
      emit(
        'update:selectedIds',
        props.selectedIds.filter((sid) => sid !== id)
      )
    } else {
      emit('update:selectedIds', [...props.selectedIds, id])
    }
  } else {
    // Single selection mode - select and close
    emit('update:selectedIds', selectedIdsSet.value.has(id) ? [] : [id])
    open.value = false
  }
}

function handleCreate() {
  const trimmed = search.value.trim()
  if (trimmed) {
    emit('create', trimmed)
    search.value = ''
    if (!props.multiple) {
      open.value = false
    }
  }
}

function handleSearch(value: string) {
  search.value = value
  isKeyboardNavActive.value = false
  focusedIndex.value = 0
}

function handleKeyDown(event: globalThis.KeyboardEvent) {
  const entityCount = filteredEntities.value.length
  const hasCreateOption = canCreate.value

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()
      isKeyboardNavActive.value = true

      if (focusedIndex.value === -1) {
        // Start from first item
        focusedIndex.value = entityCount > 0 ? 0 : hasCreateOption ? 'create' : -1
      } else if (focusedIndex.value === 'create') {
        // Already at create, stay there
      } else if (focusedIndex.value < entityCount - 1) {
        // Move down in entity list
        focusedIndex.value++
        virtualizer.value.scrollToIndex(focusedIndex.value, { align: 'center' })
      } else if (hasCreateOption) {
        // At last entity, move to create
        focusedIndex.value = 'create'
      }
      break
    }
    case 'ArrowUp': {
      event.preventDefault()
      isKeyboardNavActive.value = true

      if (focusedIndex.value === -1) {
        // Start from last item
        focusedIndex.value = hasCreateOption ? 'create' : entityCount > 0 ? entityCount - 1 : -1
      } else if (focusedIndex.value === 'create') {
        // Move from create to last entity
        focusedIndex.value = entityCount > 0 ? entityCount - 1 : -1
        if (typeof focusedIndex.value === 'number' && focusedIndex.value >= 0) {
          virtualizer.value.scrollToIndex(focusedIndex.value, { align: 'center' })
        }
      } else if (focusedIndex.value > 0) {
        // Move up in entity list
        focusedIndex.value--
        virtualizer.value.scrollToIndex(focusedIndex.value, { align: 'center' })
      }
      break
    }
    case 'Enter': {
      event.preventDefault()
      if (focusedIndex.value === 'create') {
        handleCreate()
      } else if (typeof focusedIndex.value === 'number' && focusedIndex.value >= 0) {
        const entity = filteredEntities.value[focusedIndex.value]
        if (entity) {
          handleSelect(entity.id)
        }
      }
      break
    }
  }
}

/**
 * Reset state after close animation completes.
 *
 * Why use @after-leave instead of resetting in handleOpenChange?
 * This component uses virtual scrolling - resetting `search` during close animation
 * causes `filteredEntities` to change, which triggers virtualizer height recalculation
 * and results in visible flickering. By deferring reset to after animation completes,
 * the DOM remains stable during the transition.
 *
 * Note: This pattern is specific to components with virtual lists or dynamic content
 * that affects layout. Regular Dialog forms don't need this - they can reset state
 * directly in watch(open) since their DOM structure is stable.
 */
function handleAfterLeave() {
  search.value = ''
  focusedIndex.value = -1
  isKeyboardNavActive.value = false
}

function handleOpenChange(newOpen: boolean) {
  open.value = newOpen
  if (newOpen) {
    // Focus input and scroll to selected item when opening
    nextTick(() => {
      inputRef.value?.focus()
      if (props.selectedIds.length > 0 && !props.multiple) {
        const firstSelectedId = props.selectedIds[0]
        const itemIndex = filteredEntities.value.findIndex((e) => e.id === firstSelectedId)
        if (itemIndex >= 0) {
          focusedIndex.value = itemIndex
          virtualizer.value.scrollToIndex(itemIndex, { align: 'center' })
        }
      }
    })
  }
}

function handleMouseEnter(index: number | 'create') {
  if (!isKeyboardNavActive.value) {
    focusedIndex.value = index
  }
}

function handleMouseLeave() {
  if (!isKeyboardNavActive.value) {
    focusedIndex.value = -1
  }
}

function handleMouseDown() {
  isKeyboardNavActive.value = false
}

function handleMouseMove() {
  isKeyboardNavActive.value = false
}
</script>

<template>
  <Popover
    :open="open"
    @update:open="handleOpenChange"
  >
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="props.disabled"
        :class="
          cn('justify-between px-2 py-1 hover:bg-transparent active:bg-transparent', props.class)
        "
      >
        <span :class="cn('truncate', !displayText && 'text-muted-foreground')">
          {{ displayText || props.emptyText }}
        </span>
        <Icon
          icon="icon-[mdi--unfold-more-horizontal]"
          class="size-4 shrink-0 opacity-50"
        />
      </Button>
    </PopoverTrigger>

    <PopoverContent
      class="p-0"
      align="start"
      @after-leave="handleAfterLeave"
    >
      <!-- Search input -->
      <div
        class="flex h-9 items-center gap-2 border-b px-3"
        @keydown="handleKeyDown"
      >
        <Icon
          icon="icon-[mdi--magnify]"
          class="size-4 shrink-0 opacity-50"
        />
        <input
          ref="inputRef"
          :value="search"
          :placeholder="props.placeholder"
          class="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          @input="handleSearch(($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Virtual list container -->
      <div
        ref="parentRef"
        :style="{ maxHeight: `${props.maxHeight}px` }"
        class="overflow-x-hidden overflow-y-auto scrollbar-thin p-1"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
      >
        <!-- Empty state (only when no entities and no create option) -->
        <div
          v-if="filteredEntities.length === 0"
          class="py-6 text-center text-sm text-muted-foreground"
        >
          未找到匹配项
        </div>

        <!-- Virtual list -->
        <div
          v-if="filteredEntities.length > 0"
          :style="{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }"
        >
          <div
            v-for="virtualItem in virtualizer.getVirtualItems()"
            :key="String(virtualItem.key)"
            :class="
              cn(
                'absolute left-0 top-0 w-full flex items-center gap-2 rounded-sm px-2 py-1 text-sm cursor-pointer select-none',
                focusedIndex === virtualItem.index && 'bg-accent text-accent-foreground'
              )
            "
            :style="{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }"
            @mouseenter="handleMouseEnter(virtualItem.index)"
            @mouseleave="handleMouseLeave"
            @click="handleSelect(filteredEntities[virtualItem.index].id)"
          >
            <!-- Avatar (if has imageUrl) -->
            <div
              v-if="filteredEntities[virtualItem.index].imageUrl !== undefined"
              class="size-8 shrink-0 rounded-md overflow-hidden bg-muted border shadow-sm"
            >
              <img
                v-if="filteredEntities[virtualItem.index].imageUrl"
                :src="filteredEntities[virtualItem.index].imageUrl ?? ''"
                :alt="filteredEntities[virtualItem.index].name"
                class="size-full object-cover"
              />
              <div
                v-else
                class="size-full flex items-center justify-center"
              >
                <Icon
                  icon="icon-[mdi--account]"
                  class="size-4 text-muted-foreground"
                />
              </div>
            </div>

            <!-- Text content -->
            <div class="flex-1 min-w-0">
              <div class="truncate text-sm">
                {{ filteredEntities[virtualItem.index].name }}
              </div>
              <div
                v-if="filteredEntities[virtualItem.index].subText"
                class="truncate text-xs text-muted-foreground"
              >
                {{ filteredEntities[virtualItem.index].subText }}
              </div>
            </div>

            <!-- Check icon -->
            <Icon
              icon="icon-[mdi--check]"
              :class="
                cn(
                  'size-4 shrink-0',
                  selectedIdsSet.has(filteredEntities[virtualItem.index].id)
                    ? 'opacity-100'
                    : 'opacity-0'
                )
              "
            />
          </div>
        </div>
      </div>

      <!-- Create option (fixed at bottom with border separator) -->
      <div
        v-if="canCreate"
        class="border-t p-1"
      >
        <div
          :class="
            cn(
              'flex items-center gap-2 rounded-sm px-2 py-1 text-sm cursor-pointer select-none',
              focusedIndex === 'create' && 'bg-accent text-accent-foreground'
            )
          "
          @mouseenter="handleMouseEnter('create')"
          @mouseleave="handleMouseLeave"
          @click="handleCreate"
        >
          <Icon
            icon="icon-[mdi--plus]"
            class="size-4 shrink-0"
          />
          <span class="truncate">创建 "{{ search.trim() }}"</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
