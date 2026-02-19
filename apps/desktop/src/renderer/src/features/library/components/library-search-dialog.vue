<!--
  Library Search Dialog

  Modal dialog for searching across all entity types within the library.
  Displays results in 4 columns: Games, Characters, Persons, Companies.
  Opens with Ctrl+K shortcut or via button trigger.
-->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Spinner } from '@renderer/components/ui/spinner'
import { Button } from '@renderer/components/ui/button'
import { useRenderState } from '@renderer/composables'
import { useLibrarySearch } from '../composables'
import { getAttachmentUrl, cn, getEntityIcon } from '@renderer/utils'
import type { Game, Character, Person, Company } from '@shared/db'

// =============================================================================
// Types
// =============================================================================

type EntityType = 'game' | 'character' | 'person' | 'company'

interface ColumnConfig {
  type: EntityType
  title: string
  emptyText: string
}

const COLUMNS: ColumnConfig[] = [
  { type: 'game', title: '游戏', emptyText: '无游戏结果' },
  { type: 'character', title: '角色', emptyText: '无角色结果' },
  { type: 'person', title: '人物', emptyText: '无人物结果' },
  {
    type: 'company',
    title: '公司',
    emptyText: '无公司结果'
  }
]

// =============================================================================
// Props & Emits
// =============================================================================

const open = defineModel<boolean>('open', { required: true })

// =============================================================================
// State
// =============================================================================

const router = useRouter()
const query = ref('')
const { results, isLoading, hasResults, query: debouncedQuery } = useLibrarySearch(query)
const state = useRenderState(isLoading, null, results)
const focusedIndex = ref(-1)
const inputRef = ref<HTMLInputElement>()
const contentRef = ref<HTMLDivElement>()
const prevDebouncedQuery = ref('')

// =============================================================================
// Computed
// =============================================================================

// Build flattened list of all results with column info for keyboard navigation
const flatResults = computed(() => {
  return COLUMNS.flatMap((config, columnIndex) => {
    const items = (results.value[`${config.type}s` as keyof typeof results.value] ?? []) as Array<
      Game | Character | Person | Company
    >
    return items.map((item, itemIndex) => ({
      item,
      type: config.type,
      columnIndex,
      itemIndex
    }))
  })
})

// Build column-based index map for efficient navigation
const columnItems = computed(() => {
  return COLUMNS.map((_, colIndex) =>
    flatResults.value
      .map((r, globalIndex) => ({ ...r, globalIndex }))
      .filter((r) => r.columnIndex === colIndex)
  )
})

// Total result count
const totalResultCount = computed(() => {
  return (
    results.value.games.length +
    results.value.characters.length +
    results.value.persons.length +
    results.value.companies.length
  )
})

// =============================================================================
// Methods
// =============================================================================

function getThumbnailUrl(item: Game | Character | Person | Company, type: EntityType) {
  switch (type) {
    case 'game': {
      const game = item as Game
      return game.coverFile
        ? getAttachmentUrl('games', game.id, game.coverFile, { width: 100, height: 100 })
        : null
    }
    case 'character': {
      const character = item as Character
      return character.photoFile
        ? getAttachmentUrl('characters', character.id, character.photoFile, {
            width: 100,
            height: 100
          })
        : null
    }
    case 'person': {
      const person = item as Person
      return person.photoFile
        ? getAttachmentUrl('persons', person.id, person.photoFile, { width: 100, height: 100 })
        : null
    }
    case 'company': {
      const company = item as Company
      return company.logoFile
        ? getAttachmentUrl('companies', company.id, company.logoFile, { width: 100, height: 100 })
        : null
    }
  }
}

function handleResultClick(type: EntityType, id: string) {
  open.value = false
  switch (type) {
    case 'game':
      router.push({ name: 'game-detail', params: { gameId: id } })
      break
    case 'character':
      router.push({ name: 'character-detail', params: { characterId: id } })
      break
    case 'person':
      router.push({ name: 'person-detail', params: { personId: id } })
      break
    case 'company':
      router.push({ name: 'company-detail', params: { companyId: id } })
      break
  }
}

function handleKeyDown(e: KeyboardEvent) {
  const isNavigationKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(
    e.key
  )
  if (!isNavigationKey) return
  if (flatResults.value.length === 0 && e.key !== 'Enter') return

  e.preventDefault()

  switch (e.key) {
    case 'ArrowDown': {
      if (focusedIndex.value === -1) {
        // Enter first result of first non-empty column
        const firstItem = flatResults.value[0]
        if (firstItem) focusedIndex.value = 0
      } else {
        const current = flatResults.value[focusedIndex.value]
        const col = columnItems.value[current.columnIndex]
        const currentIdx = col.findIndex((r) => r.globalIndex === focusedIndex.value)
        if (currentIdx < col.length - 1) {
          focusedIndex.value = col[currentIdx + 1].globalIndex
        }
      }
      break
    }
    case 'ArrowUp': {
      if (focusedIndex.value === -1) return
      const current = flatResults.value[focusedIndex.value]
      const col = columnItems.value[current.columnIndex]
      const currentIdx = col.findIndex((r) => r.globalIndex === focusedIndex.value)
      if (currentIdx > 0) {
        focusedIndex.value = col[currentIdx - 1].globalIndex
      } else {
        // At top of column, go back to input
        focusedIndex.value = -1
        inputRef.value?.focus()
      }
      break
    }
    case 'ArrowRight': {
      if (focusedIndex.value === -1) return
      const current = flatResults.value[focusedIndex.value]
      // Find next non-empty column
      for (let col = current.columnIndex + 1; col < 4; col++) {
        const targetCol = columnItems.value[col]
        if (targetCol.length > 0) {
          // Try to match row index, clamp to column length
          const targetIdx = Math.min(current.itemIndex, targetCol.length - 1)
          focusedIndex.value = targetCol[targetIdx].globalIndex
          break
        }
      }
      break
    }
    case 'ArrowLeft': {
      if (focusedIndex.value === -1) return
      const current = flatResults.value[focusedIndex.value]
      // Find previous non-empty column
      for (let col = current.columnIndex - 1; col >= 0; col--) {
        const targetCol = columnItems.value[col]
        if (targetCol.length > 0) {
          // Try to match row index, clamp to column length
          const targetIdx = Math.min(current.itemIndex, targetCol.length - 1)
          focusedIndex.value = targetCol[targetIdx].globalIndex
          break
        }
      }
      break
    }
    case 'Enter': {
      if (focusedIndex.value >= 0 && focusedIndex.value < flatResults.value.length) {
        const { type, item } = flatResults.value[focusedIndex.value]
        handleResultClick(type, item.id)
      }
      break
    }
  }
}

function getColumnItems(config: ColumnConfig) {
  return (results.value[`${config.type}s` as keyof typeof results.value] ?? []) as Array<
    Game | Character | Person | Company
  >
}

function getGlobalIndex(columnIndex: number, itemIndex: number) {
  return flatResults.value.findIndex(
    (r) => r.columnIndex === columnIndex && r.itemIndex === itemIndex
  )
}

// =============================================================================
// Watchers
// =============================================================================

// Reset state when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      query.value = ''
      focusedIndex.value = -1
      prevDebouncedQuery.value = ''
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

// Reset focus when results change
watch(
  () => debouncedQuery.value,
  (newQuery) => {
    if (prevDebouncedQuery.value !== newQuery) {
      prevDebouncedQuery.value = newQuery
      if (focusedIndex.value !== -1) {
        focusedIndex.value = -1
      }
    }
  }
)

// Auto-scroll focused item into view
watch(
  () => focusedIndex.value,
  (index) => {
    if (index < 0 || !contentRef.value) return

    const element = contentRef.value.querySelector(`[data-result-index="${index}"]`)
    if (element) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="max-w-5xl p-0"
      :show-close-button="false"
      @keydown="handleKeyDown"
    >
      <DialogHeader class="sr-only">
        <DialogTitle>库搜索</DialogTitle>
        <DialogDescription>搜索游戏、角色、人物和公司</DialogDescription>
      </DialogHeader>

      <!-- Search input -->
      <div class="flex items-center gap-2 px-3 py-2 border-b">
        <span class="icon-[mdi--magnify] size-5 text-muted-foreground shrink-0" />
        <Input
          ref="inputRef"
          v-model="query"
          placeholder="搜索游戏、角色、人物、公司..."
          class="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
          autofocus
        />
        <Spinner
          v-if="state === 'loading'"
          class="size-4 shrink-0"
        />
        <kbd
          class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
        >
          ESC
        </kbd>
      </div>

      <!-- Results grid -->
      <div
        ref="contentRef"
        class="grid grid-cols-4 divide-x"
      >
        <div
          v-for="(config, columnIndex) in COLUMNS"
          :key="config.type"
          class="flex flex-col min-w-0"
        >
          <!-- Column header -->
          <div
            class="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground border-b"
          >
            <span :class="`${getEntityIcon(config.type)} size-3.5`" />
            <span>{{ config.title }}</span>
            <span
              v-if="getColumnItems(config).length > 0"
              class="ml-auto text-xs"
            >
              {{ getColumnItems(config).length }}
            </span>
          </div>

          <!-- Column content -->
          <div class="overflow-auto scrollbar-thin py-1 h-[50vh]">
            <template v-if="getColumnItems(config).length === 0">
              <div class="px-2 py-4 text-xs text-muted-foreground text-center">
                {{ debouncedQuery ? config.emptyText : '输入关键词搜索' }}
              </div>
            </template>
            <template v-else>
              <div class="space-y-0.5">
                <Button
                  v-for="(item, itemIndex) in getColumnItems(config)"
                  :key="item.id"
                  variant="ghost"
                  :data-result-index="getGlobalIndex(columnIndex, itemIndex)"
                  :class="
                    cn(
                      'w-full flex items-center justify-start h-auto rounded-none gap-2 px-2 py-1.5 text-left hover:bg-accent transition-colors',
                      focusedIndex === getGlobalIndex(columnIndex, itemIndex) && 'bg-accent'
                    )
                  "
                  @click="() => handleResultClick(config.type, item.id)"
                >
                  <!-- Thumbnail -->
                  <div
                    class="size-8 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center"
                  >
                    <img
                      v-if="getThumbnailUrl(item, config.type)"
                      :src="getThumbnailUrl(item, config.type) ?? undefined"
                      :alt="item.name"
                      class="size-full object-cover"
                    />
                    <span
                      v-else
                      :class="`${getEntityIcon(config.type)} size-4 text-muted-foreground`"
                    />
                  </div>

                  <!-- Name -->
                  <span class="text-sm truncate">{{ item.name }}</span>
                </Button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground"
      >
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
            导航
          </span>
          <span class="flex items-center gap-1">
            <kbd class="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>
            选择
          </span>
        </div>
        <span v-if="hasResults">共 {{ totalResultCount }} 条结果</span>
      </div>
    </DialogContent>
  </Dialog>
</template>
