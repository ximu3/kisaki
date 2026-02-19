<!--
  CompanyDropdownMenu
  Dropdown menu for company actions.
  Used in company detail page header and dialog footer.
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
  CompanyDeleteFormDialog,
  CompanyMediaFormDialog,
  CompanyMetadataUpdateFormDialog,
  CompanyScoreFormDialog,
  CompanyExternalIdsFormDialog
} from '../forms'
import { CollectionInfoFormDialog } from '@renderer/components/shared/collection'
import CompanyMenuItems from './menu-items.vue'
import type { MenuComponents } from '@renderer/types'

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: [companyId: string]
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
      <CompanyMenuItems
        :company-id="props.companyId"
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
  <CompanyDeleteFormDialog
    v-if="deleteDialogOpen"
    v-model:open="deleteDialogOpen"
    :company-id="props.companyId"
    @deleted="emit('deleted', $event)"
  />

  <CompanyScoreFormDialog
    v-if="scoreDialogOpen"
    v-model:open="scoreDialogOpen"
    :company-id="props.companyId"
  />

  <CompanyMediaFormDialog
    v-if="mediaDialogOpen"
    v-model:open="mediaDialogOpen"
    :company-id="props.companyId"
  />

  <CompanyMetadataUpdateFormDialog
    v-if="metadataUpdateDialogOpen"
    v-model:open="metadataUpdateDialogOpen"
    :company-id="props.companyId"
  />

  <CompanyExternalIdsFormDialog
    v-if="externalIdsDialogOpen"
    v-model:open="externalIdsDialogOpen"
    :company-id="props.companyId"
  />

  <CollectionInfoFormDialog
    v-if="collectionDialogOpen"
    v-model:open="collectionDialogOpen"
    :entity-to-add="{ type: 'company', id: props.companyId }"
  />
</template>
