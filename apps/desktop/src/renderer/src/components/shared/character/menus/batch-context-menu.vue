<!--
  CharacterBatchContextMenu
  Context menu for batch operations on multiple characters.
-->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent
} from '@renderer/components/ui/context-menu'
import CharacterBatchMenuItems from './batch-menu-items.vue'
import { CharacterBatchDeleteFormDialog, CharacterBatchMetadataUpdateFormDialog } from '../forms'

interface Props {
  characterIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [characterIds: string[]]
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
      <CharacterBatchMenuItems
        :character-ids="props.characterIds"
        :enabled="menuOpen"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <CharacterBatchDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :character-ids="props.characterIds"
    @deleted="emit('deleted', $event)"
  />

  <CharacterBatchMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :character-ids="props.characterIds"
  />
</template>
