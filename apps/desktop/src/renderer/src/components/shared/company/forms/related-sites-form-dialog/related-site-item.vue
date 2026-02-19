<!--
  CompanySitesItem
  Display component for a single related site in the list.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'

interface RelatedSite {
  label: string
  url: string
}

interface Props {
  site: RelatedSite
  index: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [index: number]
  delete: [index: number]
}>()
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          icon="icon-[mdi--link-variant]"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">{{ props.site.label }}</div>
      <div class="text-xs text-muted-foreground truncate">{{ props.site.url }}</div>
    </div>
    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        @click="emit('edit', props.index)"
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
        @click="emit('delete', props.index)"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
