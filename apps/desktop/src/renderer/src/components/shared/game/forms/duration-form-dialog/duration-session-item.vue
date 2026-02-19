<!--
  GameDurationSessionItem
  Single session item component showing duration, date range, and action buttons.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { formatDuration, formatDateTimeRange } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'

interface Props {
  startedAt: Date
  endedAt: Date
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          icon="icon-[mdi--timer-outline]"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ formatDuration(props.endedAt.getTime() - props.startedAt.getTime()) }}
      </div>
      <div class="text-xs text-muted-foreground truncate">
        {{ formatDateTimeRange(props.startedAt, props.endedAt) }}
      </div>
    </div>
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
