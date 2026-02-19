<!--
  GameSearcher
  Reusable game search component.
  Supports both search by name and direct ID identification.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { formatDate } from '@renderer/utils'
import { scraperProfiles, type ScraperProfile } from '@shared/db'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Field, FieldLabel, FieldContent, FieldGroup } from '@renderer/components/ui/field'
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription
} from '@renderer/components/ui/empty'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell
} from '@renderer/components/ui/table'
import { ScraperProfileSelect } from '@renderer/components/shared/scraper'
import type { GameSearchResult } from '@shared/scraper'
import type { GameSearcherSelection } from './types'

interface Props {
  /** Default profile ID to use */
  defaultProfileId?: string
  /** Default search query */
  defaultSearchQuery?: string
  /** Default game ID */
  defaultGameId?: string
  /** Whether the component is in a loading/submitting state */
  isSubmitting?: boolean
  /** Custom class name */
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  defaultSearchQuery: '',
  defaultGameId: '',
  isSubmitting: false
})

const emit = defineEmits<{
  selectionChange: [selection: GameSearcherSelection]
}>()

// Profile state - initialized via watch to maintain reactivity
const selectedProfileId = ref('')
const selectedProfile = ref<ScraperProfile | null>(null)

// Initialize from props
watch(
  () => props.defaultProfileId,
  (defaultId) => {
    if (defaultId && !selectedProfileId.value) {
      selectedProfileId.value = defaultId
    }
  },
  { immediate: true }
)

// Fetch profile details when profileId changes (for searchProviderId)
watch(
  selectedProfileId,
  async (id) => {
    if (id) {
      const profile = await db.query.scraperProfiles.findFirst({
        where: eq(scraperProfiles.id, id)
      })
      selectedProfile.value = profile ?? null
    } else {
      selectedProfile.value = null
    }
  },
  { immediate: true }
)

// Search state - use computed for props to maintain reactivity
const searchQuery = ref('')
watch(
  () => props.defaultSearchQuery,
  (defaultQuery) => {
    if (defaultQuery !== undefined) {
      searchQuery.value = defaultQuery
    }
  },
  { immediate: true }
)
const isSearching = ref(false)
const searchResults = ref<GameSearchResult[]>([])
const hasSearched = ref(false)

// ID state
const gameId = ref('')
watch(
  () => props.defaultGameId,
  (defaultId) => {
    if (defaultId !== undefined) {
      gameId.value = defaultId
    }
  },
  { immediate: true }
)
const selectedResultId = ref<string | null>(null)

// Notify parent when relevant state changes
const canSubmit = computed(
  () => !!selectedProfileId.value && !!gameId.value.trim() && !props.isSubmitting
)

watch(
  [selectedProfileId, selectedProfile, gameId],
  () => {
    const trimmedGameId = gameId.value.trim()
    const selectedResult = searchResults.value.find((r) => r.id === trimmedGameId)
    const fallbackKnownIds =
      selectedProfile.value?.searchProviderId && trimmedGameId
        ? [{ source: selectedProfile.value.searchProviderId, id: trimmedGameId }]
        : []

    emit('selectionChange', {
      profileId: selectedProfileId.value,
      gameId: trimmedGameId,
      gameName: selectedResult?.name ?? searchQuery.value.trim(),
      originalName: selectedResult?.originalName,
      knownIds: selectedResult?.externalIds ?? fallbackKnownIds,
      canSubmit: canSubmit.value
    })
  },
  { immediate: true }
)

async function handleSearch() {
  if (!searchQuery.value.trim() || !selectedProfileId.value) return

  isSearching.value = true
  hasSearched.value = true
  searchResults.value = []
  selectedResultId.value = null

  try {
    const result = await ipcManager.invoke(
      'scraper:search-game',
      selectedProfileId.value,
      searchQuery.value.trim()
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    searchResults.value = result.data ?? []
  } catch (error) {
    notify.error('搜索失败', error instanceof Error ? error.message : '未知错误')
  } finally {
    isSearching.value = false
  }
}

function handleSearchKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSearch()
  }
}

function handleResultSelect(result: GameSearchResult) {
  selectedResultId.value = result.id
  gameId.value = result.id
}

// Computed model for game ID input (clears selection when manually edited)
const gameIdModel = computed({
  get: () => gameId.value,
  set: (v: string) => {
    gameId.value = v
    selectedResultId.value = null
  }
})
</script>

<template>
  <FieldGroup :class="props.class">
    <!-- Profile selector -->
    <Field>
      <FieldLabel>刮削配置</FieldLabel>
      <FieldContent>
        <ScraperProfileSelect
          v-model="selectedProfileId"
          media-type="game"
        />
      </FieldContent>
    </Field>

    <!-- Search section -->
    <Field>
      <FieldLabel>搜索游戏</FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="searchQuery"
            placeholder="输入游戏名称..."
            :disabled="!selectedProfileId || isSearching"
            class="flex-1"
            @keydown="handleSearchKeyDown"
          />
          <Button
            type="button"
            variant="secondary"
            :disabled="!searchQuery.trim() || !selectedProfileId || isSearching"
            @click="handleSearch"
          >
            <Icon
              v-if="isSearching"
              icon="icon-[mdi--loading]"
              class="size-4 animate-spin"
            />
            <Icon
              v-else
              icon="icon-[mdi--magnify]"
              class="size-4"
            />
            搜索
          </Button>
        </div>
      </FieldContent>
    </Field>

    <!-- Search results table -->
    <div class="border border-border rounded-md overflow-hidden">
      <Table
        class="table-fixed"
        container-class="overflow-visible"
      >
        <TableHeader class="bg-muted/60">
          <TableRow class="hover:bg-transparent border-border">
            <TableHead>名称</TableHead>
            <TableHead class="w-[30%]">原名</TableHead>
            <TableHead class="w-30">发售日期</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <!-- Scrollable body -->
      <div class="h-[20vh] overflow-auto scrollbar-thin">
        <Empty
          v-if="!hasSearched"
          class="h-full border-0"
        >
          <EmptyHeader>
            <EmptyMedia>
              <Icon
                icon="icon-[mdi--magnify]"
                class="size-6 text-muted-foreground/50"
              />
            </EmptyMedia>
            <EmptyDescription>输入游戏名称开始搜索</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty
          v-else-if="isSearching"
          class="h-full border-0"
        >
          <EmptyHeader>
            <EmptyMedia>
              <Icon
                icon="icon-[mdi--loading]"
                class="size-6 text-muted-foreground animate-spin"
              />
            </EmptyMedia>
            <EmptyDescription>搜索中...</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Empty
          v-else-if="searchResults.length === 0"
          class="h-full border-0"
        >
          <EmptyHeader>
            <EmptyMedia>
              <Icon
                icon="icon-[mdi--magnify-close]"
                class="size-6 text-muted-foreground/50"
              />
            </EmptyMedia>
            <EmptyTitle class="text-sm">无匹配结果</EmptyTitle>
            <EmptyDescription>请尝试其他关键词</EmptyDescription>
          </EmptyHeader>
        </Empty>

        <Table
          v-else
          class="table-fixed"
          container-class="overflow-visible"
        >
          <TableBody>
            <TableRow
              v-for="result in searchResults"
              :key="result.id"
              :data-state="selectedResultId === result.id ? 'selected' : undefined"
              class="cursor-pointer text-xs border-border"
              @click="handleResultSelect(result)"
            >
              <TableCell class="truncate max-w-0">{{ result.name }}</TableCell>
              <TableCell class="w-[30%] text-muted-foreground truncate max-w-0">
                {{ result.originalName || '-' }}
              </TableCell>
              <TableCell class="w-30 text-muted-foreground">
                {{ formatDate(result.releaseDate ?? null) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Results count footer -->
      <Table
        class="table-fixed"
        container-class="overflow-visible"
      >
        <TableFooter class="bg-muted/30">
          <TableRow class="hover:bg-transparent border-t border-border">
            <TableCell
              colspan="3"
              class="h-6 py-0 text-[10px] text-muted-foreground"
            >
              共 {{ searchResults.length }} 条结果
              <template v-if="selectedResultId"> · 已选择 1 条</template>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>

    <!-- ID input -->
    <Field>
      <FieldLabel>游戏 ID</FieldLabel>
      <FieldContent>
        <Input
          v-model="gameIdModel"
          placeholder="从上方选择或直接输入..."
          :disabled="!selectedProfileId || props.isSubmitting"
          class="font-mono text-xs"
        />
      </FieldContent>
    </Field>
  </FieldGroup>
</template>
