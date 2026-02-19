<!--
  GameContextMenu
  Context menu for game items (right-click menu).
  Dialog states are managed here to prevent unmount issues when menu closes.
-->
<script setup lang="ts">
import { ref } from 'vue'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem
} from '@renderer/components/ui/context-menu'
import {
  GameDeleteFormDialog,
  GameScoreFormDialog,
  GameLaunchConfigFormDialog,
  GameMediaFormDialog,
  GameMetadataUpdateFormDialog,
  GameExternalIdsFormDialog
} from '../forms'
import { CollectionInfoFormDialog } from '@renderer/components/shared/collection'
import GameMenuItems from './menu-items.vue'
import type { MenuComponents } from '@renderer/types'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [gameId: string]
}>()

// Context menu components adapter
const contextMenuComponents: MenuComponents = {
  Item: ContextMenuItem,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
  Separator: ContextMenuSeparator,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem
}

// Menu open state for lazy loading
const menuOpen = ref(false)

// Dialog states managed by parent to survive menu close
const deleteDialogOpen = ref(false)
const launchConfigDialogOpen = ref(false)
const mediaDialogOpen = ref(false)
const scoreDialogOpen = ref(false)
const collectionDialogOpen = ref(false)
const metadataUpdateDialogOpen = ref(false)
const externalIdsDialogOpen = ref(false)
</script>

<template>
  <ContextMenu v-model:open="menuOpen">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-56">
      <GameMenuItems
        :game-id="props.gameId"
        :components="contextMenuComponents"
        :enabled="menuOpen"
        @open-score-dialog="scoreDialogOpen = true"
        @open-launch-config-dialog="launchConfigDialogOpen = true"
        @open-media-dialog="mediaDialogOpen = true"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-external-ids-dialog="externalIdsDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
        @open-new-collection-dialog="collectionDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <!-- Dialogs rendered outside menu to survive menu close -->
  <GameDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :game-id="props.gameId"
    @deleted="emit('deleted', $event)"
  />

  <GameScoreFormDialog
    v-if="scoreDialogOpen"
    v-model:open="scoreDialogOpen"
    :game-id="props.gameId"
  />

  <GameLaunchConfigFormDialog
    v-if="launchConfigDialogOpen"
    v-model:open="launchConfigDialogOpen"
    :game-id="props.gameId"
  />

  <GameMediaFormDialog
    v-if="mediaDialogOpen"
    v-model:open="mediaDialogOpen"
    :game-id="props.gameId"
  />

  <GameMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :game-id="props.gameId"
  />

  <GameExternalIdsFormDialog
    v-if="externalIdsDialogOpen"
    v-model:open="externalIdsDialogOpen"
    :game-id="props.gameId"
  />

  <CollectionInfoFormDialog
    v-if="collectionDialogOpen"
    v-model:open="collectionDialogOpen"
    :entity-to-add="{ type: 'game', id: props.gameId }"
  />
</template>
