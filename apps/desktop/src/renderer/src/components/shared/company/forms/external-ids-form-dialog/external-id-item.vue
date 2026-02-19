<!--
  ExternalIdItem
  Single external ID item component.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'

interface Props {
  source: string
  externalId: string
  isFirst: boolean
  isLast: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          icon="icon-[mdi--card-text-outline]"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">{{ props.source.toUpperCase() }}</div>
      <div class="text-xs text-muted-foreground truncate">{{ props.externalId }}</div>
    </div>
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="props.isFirst"
        class="size-7"
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
        :disabled="props.isLast"
        class="size-7"
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
