<!--
  CompanyBatchContextMenu
  Context menu for batch operations on multiple companies.
-->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent
} from '@renderer/components/ui/context-menu'
import CompanyBatchMenuItems from './batch-menu-items.vue'
import { CompanyBatchDeleteFormDialog, CompanyBatchMetadataUpdateFormDialog } from '../forms'

interface Props {
  companyIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [companyIds: string[]]
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
      <CompanyBatchMenuItems
        :company-ids="props.companyIds"
        :enabled="menuOpen"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <CompanyBatchDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :company-ids="props.companyIds"
    @deleted="emit('deleted', $event)"
  />

  <CompanyBatchMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :company-ids="props.companyIds"
  />
</template>
