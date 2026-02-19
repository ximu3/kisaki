<!--
  TagDetailContent
  Content area for tag detail views (dialog).
  Uses useTag() composable for data.
  Shows entities that have this tag attached.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useTag, useRenderState } from '@renderer/composables'
import { getEntityIcon } from '@renderer/utils'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@renderer/components/ui/empty'
import { Spinner } from '@renderer/components/ui/spinner'
import { VirtualGrid } from '@renderer/components/ui/virtual'
import { EntityCard } from '@renderer/components/shared'
import type { ContentEntityType } from '@shared/common'
import type { Game, Character, Person, Company } from '@shared/db'

interface Props {
  scrollParent?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  scrollParent: null
})

type EntityData = Game | Character | Person | Company

const ENTITY_LABELS: Record<ContentEntityType, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司'
}

const { tag, entities, entityType, isLoading, error } = useTag()
const state = useRenderState(isLoading, error, tag)

const entityLabel = computed(() => ENTITY_LABELS[entityType.value])

const emit = defineEmits<{
  (e: 'entity-click', payload: { type: ContentEntityType; id: string; entity: EntityData }): void
}>()

function handleItemClick(entity: EntityData) {
  if (state.value !== 'success') return
  emit('entity-click', { type: entityType.value, id: entity.id, entity })
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="state === 'loading'"
    class="h-full flex items-center justify-center"
  >
    <Spinner class="size-8" />
  </div>

  <!-- Error state -->
  <div
    v-else-if="state === 'error'"
    class="h-full flex items-center justify-center"
  >
    <div class="text-center">
      <Icon
        icon="icon-[mdi--alert-circle-outline]"
        class="size-12 text-destructive/50 mb-3 mx-auto"
      />
      <p class="text-lg font-medium">加载失败</p>
      <p class="text-sm text-muted-foreground mt-1">
        {{ error?.message ?? error }}
      </p>
    </div>
  </div>

  <!-- Not found state -->
  <div
    v-else-if="state === 'not-found'"
    class="h-full flex items-center justify-center"
  >
    <div class="text-center">
      <Icon
        icon="icon-[mdi--tag-off-outline]"
        class="size-12 text-muted-foreground/50 mb-3 mx-auto"
      />
      <p class="text-lg font-medium">标签不存在</p>
      <p class="text-sm text-muted-foreground mt-1">该标签可能已被删除</p>
    </div>
  </div>

  <!-- Empty state -->
  <Empty
    v-else-if="state === 'success' && entities.length === 0"
    class="h-full border-none"
  >
    <EmptyHeader>
      <EmptyMedia>
        <Icon
          :icon="getEntityIcon('tag')"
          class="size-12 text-muted-foreground/50"
        />
      </EmptyMedia>
      <EmptyTitle>此标签暂无{{ entityLabel }}</EmptyTitle>
      <EmptyDescription>尚无{{ entityLabel }}使用此标签</EmptyDescription>
    </EmptyHeader>
  </Empty>

  <!-- Content -->
  <VirtualGrid
    v-else-if="state === 'success'"
    :items="entities"
    :get-key="(item) => item.id"
    :scroll-parent="props.scrollParent"
    class="grid grid-cols-[repeat(auto-fill,8rem)] gap-3 justify-between"
  >
    <template #item="{ item }">
      <EntityCard
        :entity-type="entityType"
        :entity="item"
        class="w-full"
        @click="handleItemClick(item)"
      />
    </template>
  </VirtualGrid>
</template>
