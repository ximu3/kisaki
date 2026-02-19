<!--
  PersonDropdownMenu
  Click menu for person entities.
  Used in detail page headers and dialog footers.
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
  PersonDeleteFormDialog,
  PersonMediaFormDialog,
  PersonMetadataUpdateFormDialog,
  PersonScoreFormDialog,
  PersonExternalIdsFormDialog
} from '../forms'
import { CollectionInfoFormDialog } from '@renderer/components/shared/collection'
import PersonMenuItems from './menu-items.vue'
import type { MenuComponents } from '@renderer/types'

interface Props {
  personId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [personId: string]
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
      <PersonMenuItems
        :person-id="props.personId"
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
  <PersonDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :person-id="props.personId"
    @deleted="emit('deleted', $event)"
  />

  <PersonScoreFormDialog
    v-if="scoreDialogOpen"
    v-model:open="scoreDialogOpen"
    :person-id="props.personId"
  />

  <PersonMediaFormDialog
    v-if="mediaDialogOpen"
    v-model:open="mediaDialogOpen"
    :person-id="props.personId"
  />

  <PersonMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :person-id="props.personId"
  />

  <PersonExternalIdsFormDialog
    v-if="externalIdsDialogOpen"
    v-model:open="externalIdsDialogOpen"
    :person-id="props.personId"
  />

  <CollectionInfoFormDialog
    v-if="collectionDialogOpen"
    v-model:open="collectionDialogOpen"
    :entity-to-add="{ type: 'person', id: props.personId }"
  />
</template>
