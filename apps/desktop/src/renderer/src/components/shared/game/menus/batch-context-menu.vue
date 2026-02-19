<!--
  GameBatchContextMenu
  Context menu for batch operations on multiple games.
-->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent
} from '@renderer/components/ui/context-menu'
import GameBatchMenuItems from './batch-menu-items.vue'
import { GameBatchDeleteFormDialog, GameBatchMetadataUpdateFormDialog } from '../forms'

interface Props {
  gameIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [gameIds: string[]]
}>()

const menuOpen = ref(false)
const deleteDialogOpen = ref(false)
const metadataUpdateDialogOpen = ref(false)
</script>

<template>
  <ContextMenu v-model:open="menuOpen">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-56">
      <GameBatchMenuItems
        :game-ids="props.gameIds"
        :enabled="menuOpen"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <GameBatchDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :game-ids="props.gameIds"
    @deleted="emit('deleted', $event)"
  />

  <GameBatchMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :game-ids="props.gameIds"
  />
</template>
