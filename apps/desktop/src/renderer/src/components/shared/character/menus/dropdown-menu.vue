<!--
  CharacterDropdownMenu
  Dropdown menu for character actions.
  Used in character detail page header and dialog footer.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@renderer/components/ui/dropdown-menu'
import { Button } from '@renderer/components/ui/button'
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

// Dropdown menu components adapter
const dropdownMenuComponents: MenuComponents = {
  Item: DropdownMenuItem,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
  Separator: DropdownMenuSeparator,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem
}

// Dialog states managed by parent to survive menu close
const deleteDialogOpen = ref(false)
const mediaDialogOpen = ref(false)
const scoreDialogOpen = ref(false)
const metadataUpdateDialogOpen = ref(false)
const collectionDialogOpen = ref(false)
const externalIdsDialogOpen = ref(false)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot>
        <Button
          variant="secondary"
          size="icon-sm"
        >
          <Icon
            icon="icon-[mdi--dots-horizontal]"
            class="size-4"
          />
        </Button>
      </slot>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      class="w-56"
    >
      <CharacterMenuItems
        :character-id="props.characterId"
        :components="dropdownMenuComponents"
        @open-score-dialog="scoreDialogOpen = true"
        @open-media-dialog="mediaDialogOpen = true"
        @open-metadata-update-dialog="metadataUpdateDialogOpen = true"
        @open-external-ids-dialog="externalIdsDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
        @open-new-collection-dialog="collectionDialogOpen = true"
      />
    </DropdownMenuContent>
  </DropdownMenu>

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
