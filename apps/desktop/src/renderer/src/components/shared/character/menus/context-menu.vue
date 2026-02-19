<!--
  CharacterContextMenu
  Context menu for character items (right-click menu).
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
  CharacterDeleteFormDialog,
  CharacterMediaFormDialog,
  CharacterMetadataUpdateFormDialog,
  CharacterScoreFormDialog,
  CharacterExternalIdsFormDialog
} from '../forms'
import { CollectionInfoFormDialog } from '@renderer/components/shared/collection'
import CharacterMenuItems from './menu-items.vue'
import type { MenuComponents } from '@renderer/types'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [characterId: string]
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
const mediaDialogOpen = ref(false)
const scoreDialogOpen = ref(false)
const metadataUpdateDialogOpen = ref(false)
const collectionDialogOpen = ref(false)
const externalIdsDialogOpen = ref(false)
</script>

<template>
  <ContextMenu v-model:open="menuOpen">
    <ContextMenuTrigger as-child>
      <slot />
    </ContextMenuTrigger>
    <ContextMenuContent class="w-56">
      <CharacterMenuItems
        :character-id="props.characterId"
        :components="contextMenuComponents"
        :enabled="menuOpen"
        @open-score-dialog="scoreDialogOpen = true"
        @open-media-dialog="mediaDialogOpen = true"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-external-ids-dialog="externalIdsDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
        @open-new-collection-dialog="collectionDialogOpen = true"
      />
    </ContextMenuContent>
  </ContextMenu>

  <!-- Dialogs rendered outside menu to survive menu close -->
  <CharacterDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :character-id="props.characterId"
    @deleted="emit('deleted', $event)"
  />

  <CharacterScoreFormDialog
    v-if="scoreDialogOpen"
    v-model:open="scoreDialogOpen"
    :character-id="props.characterId"
  />

  <CharacterMediaFormDialog
    v-if="mediaDialogOpen"
    v-model:open="mediaDialogOpen"
    :character-id="props.characterId"
  />

  <CharacterMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :character-id="props.characterId"
  />

  <CharacterExternalIdsFormDialog
    v-if="externalIdsDialogOpen"
    v-model:open="externalIdsDialogOpen"
    :character-id="props.characterId"
  />

  <CollectionInfoFormDialog
    v-if="collectionDialogOpen"
    v-model:open="collectionDialogOpen"
    :entity-to-add="{ type: 'character', id: props.characterId }"
  />
</template>
