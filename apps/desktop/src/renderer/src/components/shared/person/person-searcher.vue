<!--
  PersonSearcher
  Reusable person search component.
  Supports both search by name and direct ID identification.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { formatDate } from '@renderer/utils'
import { scraperProfiles, type ScraperProfile } from '@shared/db'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldGroup,
  FieldDescription
} from '@renderer/components/ui/field'
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
import type { PersonSearchResult } from '@shared/scraper'
import type { PersonSearcherSelection } from './types'

interface Props {
  /** Default profile ID to use */
  defaultProfileId?: string
  /** Default search query */
  defaultSearchQuery?: string
  /** Default person ID */
  defaultPersonId?: string
  /** Whether the component is in a loading/submitting state */
  isSubmitting?: boolean
  /** Custom class name */
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  defaultSearchQuery: '',
  defaultPersonId: '',
  isSubmitting: false
})

const emit = defineEmits<{
  selectionChange: [selection: PersonSearcherSelection]
}>()

// Profile state - initialized via watch to maintain reactivity
const selectedProfileId = ref('')
const selectedProfile = ref<ScraperProfile | null>(null)

watch(
  () => props.defaultProfileId,
  (defaultId) => {
    if (defaultId && !selectedProfileId.value) {
      selectedProfileId.value = defaultId
    }
  },
  { immediate: true }
)

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

// Search state
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
const searchResults = ref<PersonSearchResult[]>([])
const hasSearched = ref(false)

// ID state
const personId = ref('')
watch(
  () => props.defaultPersonId,
  (defaultId) => {
    if (defaultId !== undefined) {
      personId.value = defaultId
    }
  },
  { immediate: true }
)
const selectedResultId = ref<string | null>(null)

const canSubmit = computed(
  () => !!selectedProfileId.value && !!personId.value.trim() && !props.isSubmitting
)

watch(
  [selectedProfileId, selectedProfile, personId],
  () => {
    const trimmedId = personId.value.trim()
    const selectedResult = searchResults.value.find((r) => r.id === trimmedId)
    const fallbackKnownIds =
      selectedProfile.value?.searchProviderId && trimmedId
        ? [{ source: selectedProfile.value.searchProviderId, id: trimmedId }]
        : []

    emit('selectionChange', {
      profileId: selectedProfileId.value,
      personId: trimmedId,
      personName: selectedResult?.name ?? searchQuery.value.trim(),
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
      'scraper:search-person',
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

function handleResultSelect(result: PersonSearchResult) {
  selectedResultId.value = result.id
  personId.value = result.id
}

const personIdModel = computed({
  get: () => personId.value,
  set: (v: string) => {
    personId.value = v
    selectedResultId.value = null
  }
})
</script>

<template>
  <FieldGroup :class="props.class">
    <Field>
      <FieldLabel>刮削配置</FieldLabel>
      <FieldContent>
        <ScraperProfileSelect
          v-model="selectedProfileId"
          media-type="person"
        />
      </FieldContent>
    </Field>

    <Field>
      <FieldLabel>搜索人物</FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="searchQuery"
            placeholder="输入人物名称..."
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

    <div class="border border-border rounded-md overflow-hidden">
      <Table
        class="table-fixed"
        container-class="overflow-visible"
      >
        <TableHeader class="bg-muted/60">
          <TableRow class="hover:bg-transparent border-border">
            <TableHead class="h-7 text-[11px]">名称</TableHead>
            <TableHead class="h-7 text-[11px] w-[28%]">原名</TableHead>
            <TableHead class="h-7 text-[11px] w-28">出生</TableHead>
            <TableHead class="h-7 text-[11px] w-28">逝世</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

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
            <EmptyDescription>输入人物名称开始搜索</EmptyDescription>
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
            <EmptyDescription>请尝试其它关键词</EmptyDescription>
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
              <TableCell class="w-[28%] text-muted-foreground truncate max-w-0">
                {{ result.originalName || '-' }}
              </TableCell>
              <TableCell class="w-28 text-muted-foreground">
                {{ formatDate(result.birthDate ?? null) }}
              </TableCell>
              <TableCell class="w-28 text-muted-foreground">
                {{ formatDate(result.deathDate ?? null) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

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

    <Field>
      <FieldLabel>
        <span>人物 ID</span>
        <FieldDescription>从搜索结果选择或直接输入 ID</FieldDescription>
      </FieldLabel>
      <FieldContent>
        <Input
          v-model="personIdModel"
          placeholder="从上方选择或直接输入..."
          :disabled="!selectedProfileId || props.isSubmitting"
          class="font-mono text-xs"
        />
      </FieldContent>
    </Field>
  </FieldGroup>
</template>
