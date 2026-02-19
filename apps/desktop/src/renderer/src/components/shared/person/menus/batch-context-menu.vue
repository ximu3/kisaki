<!--
  PersonBatchContextMenu
  Context menu for batch operations on multiple persons.
-->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent
} from '@renderer/components/ui/context-menu'
import PersonBatchMenuItems from './batch-menu-items.vue'
import { PersonBatchDeleteFormDialog, PersonBatchMetadataUpdateFormDialog } from '../forms'

interface Props {
  personIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [personIds: string[]]
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
      <PersonBatchMenuItems
        :person-ids="props.personIds"
        :enabled="menuOpen"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <PersonBatchDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :person-ids="props.personIds"
    @deleted="emit('deleted', $event)"
  />

  <PersonBatchMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :person-ids="props.personIds"
  />
</template>
