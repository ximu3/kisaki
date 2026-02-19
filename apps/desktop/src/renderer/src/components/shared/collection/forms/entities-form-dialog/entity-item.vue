<!--
  CollectionEntitiesItem
  Single entity link item in the collection entities form dialog.
  Displays entity info and action buttons.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { getEntityIcon } from '@renderer/utils'
import type { ContentEntityType } from '@shared/common'

interface EntityLink {
  id: string
  entityId: string
  entityName: string
  entityType: ContentEntityType
  note: string
  orderInCollection: number
  isNew?: boolean
}

interface Props {
  link: EntityLink
  index: number
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  moveUp: []
  moveDown: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          :icon="getEntityIcon(props.link.entityType)"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium text-sm truncate">{{ props.link.entityName }}</div>
      <div
        v-if="props.link.note"
        class="text-xs text-muted-foreground truncate"
      >
        {{ props.link.note }}
      </div>
    </div>
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.index === 0"
        @click="emit('moveUp')"
      >
        <Icon
          icon="icon-[mdi--chevron-up]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.index === props.totalCount - 1"
        @click="emit('moveDown')"
      >
        <Icon
          icon="icon-[mdi--chevron-down]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        @click="emit('edit')"
      >
        <Icon
          icon="icon-[mdi--pencil-outline]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7 text-destructive hover:text-destructive"
        @click="emit('delete')"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
