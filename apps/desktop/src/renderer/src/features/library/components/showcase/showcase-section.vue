<!--
  LibraryShowcaseSection - Single section renderer
  Renders a section with its data based on layout type.
  Scroll controls are integrated into the header row.
-->
<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { VirtualGrid, VirtualHorizontalScroll } from '@renderer/components/ui/virtual'
import { EntityCard } from '@renderer/components/shared'
import { GameDetailDialog } from '@renderer/components/shared/game'
import { CharacterDetailDialog } from '@renderer/components/shared/character'
import { PersonDetailDialog } from '@renderer/components/shared/person'
import { CompanyDetailDialog } from '@renderer/components/shared/company'
import { CollectionDetailDialog } from '@renderer/components/shared/collection'
import { TagDetailDialog } from '@renderer/components/shared/tag'
import { useSectionData, type SectionEntityData } from '../../composables'
import { useRenderState } from '@renderer/composables'
import type { ShowcaseSection } from '@shared/db'
import type { AllEntityType } from '@shared/common'

interface Props {
  section: ShowcaseSection
}

const props = defineProps<Props>()
const router = useRouter()

// Inject scroll container from parent showcase
const scrollContainer = inject<Ref<HTMLElement | undefined>>('showcaseScrollContainer')

const { data, isLoading } = useSectionData(() => props.section)
const state = useRenderState(isLoading, null, data)

const scrollRef = ref<{ scrollLeft: () => void; scrollRight: () => void }>()
const scrollState = ref({ canScrollLeft: false, canScrollRight: false })

const isHorizontal = computed(() => props.section.layout === 'horizontal')
const showScrollButtons = computed(
  () => isHorizontal.value && data.value.length > 0 && !isLoading.value
)
const entityType = computed(() => props.section.entityType as AllEntityType)
const isDialogMode = computed(() => props.section.openMode === 'dialog')

const detailDialogOpen = ref(false)
const detailEntityId = ref<string | null>(null)
const selectedEntityId = computed(() => detailEntityId.value ?? '')

const entityLabel = computed(() => {
  const labels: Record<AllEntityType, string> = {
    game: '游戏',
    character: '角色',
    person: '人物',
    company: '公司',
    collection: '合集',
    tag: '标签'
  }
  return labels[entityType.value] ?? ''
})

function handleScrollStateChange(state: { canScrollLeft: boolean; canScrollRight: boolean }) {
  scrollState.value = state
}

function handleItemClick(item: SectionEntityData) {
  const type = entityType.value

  if (isDialogMode.value) {
    detailEntityId.value = item.id
    detailDialogOpen.value = true
    return
  }

  router.push(getDetailPath(type, item.id))
}

function getDetailPath(entityType: AllEntityType, id: string): string {
  switch (entityType) {
    case 'game':
      return `/library/game/${id}`
    case 'character':
      return `/library/character/${id}`
    case 'person':
      return `/library/person/${id}`
    case 'company':
      return `/library/company/${id}`
    case 'collection':
      return `/library/collection/${id}`
    case 'tag':
      return `/library/tag/${id}`
  }
}
</script>

<template>
  <div class="relative group">
    <!-- Section header with scroll controls -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold">{{ props.section.name }}</h3>
      </div>

      <!-- Scroll controls - only for horizontal layout -->
      <div
        v-if="showScrollButtons"
        class="flex items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          :disabled="!scrollState.canScrollLeft"
          class="size-6 opacity-60 hover:opacity-100 disabled:opacity-30"
          @click="scrollRef?.scrollLeft()"
        >
          <span class="icon-[mdi--chevron-left] size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          :disabled="!scrollState.canScrollRight"
          class="size-6 opacity-60 hover:opacity-100 disabled:opacity-30"
          @click="scrollRef?.scrollRight()"
        >
          <span class="icon-[mdi--chevron-right] size-4" />
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="state === 'loading'"
      class="flex items-center justify-center py-8"
    >
      <Spinner class="size-6" />
    </div>

    <!-- Success state -->
    <template v-else-if="state === 'success'">
      <!-- Empty state -->
      <div
        v-if="data.length === 0"
        class="flex items-center justify-center py-8 text-xs text-muted-foreground"
      >
        暂无{{ entityLabel }}
      </div>

      <!-- Horizontal layout -->
      <div
        v-else-if="isHorizontal"
        class="-mx-4 px-4"
      >
        <VirtualHorizontalScroll
          ref="scrollRef"
          :items="data"
          class="flex gap-3"
          @scroll-state-change="handleScrollStateChange"
        >
          <template #item="{ item }">
            <EntityCard
              :entity-type="entityType"
              :entity="item"
              :size="props.section.itemSize"
              class="shrink-0"
              @click="handleItemClick(item)"
            />
          </template>
        </VirtualHorizontalScroll>
      </div>

      <!-- Grid layout -->
      <VirtualGrid
        v-else
        :items="data"
        :scroll-parent="scrollContainer ?? undefined"
        class="grid grid-cols-[repeat(auto-fill,8rem)] gap-3 justify-between"
      >
        <template #item="{ item }">
          <EntityCard
            :entity-type="entityType"
            :entity="item"
            :size="props.section.itemSize"
            class="w-full"
            @click="handleItemClick(item)"
          />
        </template>
      </VirtualGrid>
    </template>

    <!-- Entity detail dialog -->
    <GameDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'game' && isDialogMode"
      v-model:open="detailDialogOpen"
      :game-id="selectedEntityId"
    />
    <CharacterDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'character' && isDialogMode"
      v-model:open="detailDialogOpen"
      :character-id="selectedEntityId"
    />
    <PersonDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'person' && isDialogMode"
      v-model:open="detailDialogOpen"
      :person-id="selectedEntityId"
    />
    <CompanyDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'company' && isDialogMode"
      v-model:open="detailDialogOpen"
      :company-id="selectedEntityId"
    />
    <CollectionDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'collection' && isDialogMode"
      v-model:open="detailDialogOpen"
      :collection-id="selectedEntityId"
    />
    <TagDetailDialog
      v-if="detailDialogOpen && detailEntityId && entityType === 'tag' && isDialogMode"
      v-model:open="detailDialogOpen"
      :tag-id="selectedEntityId"
    />
  </div>
</template>
