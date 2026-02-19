<!--
  CollectionDropdownMenu

  Dropdown menu for collection actions (click menu).
  Use in collection detail page header settings button.
  Supports both static and dynamic collections.
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
import CollectionMenuItems from './menu-items.vue'
import {
  CollectionInfoFormDialog,
  CollectionEntitiesFormDialog,
  CollectionDynamicConfigFormDialog,
  CollectionConvertToStaticFormDialog,
  CollectionDeleteFormDialog
} from '../forms'
import type { MenuComponents } from '@renderer/types'

interface Props {
  collectionId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [collectionId: string]
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
const editMetadataDialogOpen = ref(false)
const editEntitiesDialogOpen = ref(false)
const editFilterDialogOpen = ref(false)
const convertDialogOpen = ref(false)
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
      <CollectionMenuItems
        :collection-id="props.collectionId"
        :components="dropdownMenuComponents"
        @open-edit-metadata-dialog="editMetadataDialogOpen = true"
        @open-edit-entities-dialog="editEntitiesDialogOpen = true"
        @open-edit-filter-dialog="editFilterDialogOpen = true"
        @open-convert-dialog="convertDialogOpen = true"
        @open-delete-dialog="deleteDialogOpen = true"
      />
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Dialogs rendered outside menu to survive menu close -->
  <CollectionDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :collection-id="props.collectionId"
    @deleted="emit('deleted', $event)"
  />

  <CollectionInfoFormDialog
    v-if="editMetadataDialogOpen"
    v-model:open="editMetadataDialogOpen"
    :collection-id="props.collectionId"
  />

  <CollectionEntitiesFormDialog
    v-if="editEntitiesDialogOpen"
    v-model:open="editEntitiesDialogOpen"
    :collection-id="props.collectionId"
  />

  <CollectionDynamicConfigFormDialog
    v-if="editFilterDialogOpen"
    v-model:open="editFilterDialogOpen"
    :collection-id="props.collectionId"
  />

  <!-- Convert to static confirmation -->
  <CollectionConvertToStaticFormDialog
    v-if="convertDialogOpen"
    v-model:open="convertDialogOpen"
    :collection-id="props.collectionId"
  />
</template>
