<script setup lang="ts">
/**
 * ExplorerFooter - Bottom statistics
 *
 * Shows entity count and type.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLibraryExplorerStore } from '../../stores'
import { useExplorerList } from '../../composables'
import type { ContentEntityType } from '@shared/common'

const ENTITY_LABELS: Record<ContentEntityType, string> = {
  game: '游戏',
  character: '角色',
  person: '人物',
  company: '公司'
}

const store = useLibraryExplorerStore()
const { activeEntityType } = storeToRefs(store)
const { data } = useExplorerList()

const label = computed(() => ENTITY_LABELS[activeEntityType.value])
</script>

<template>
  <div
    class="shrink-0 flex items-center h-8 px-3 border-t text-[11px] tabular-nums text-muted-foreground/60"
  >
    {{ data.totalCount }} 个{{ label }}
  </div>
</template>
