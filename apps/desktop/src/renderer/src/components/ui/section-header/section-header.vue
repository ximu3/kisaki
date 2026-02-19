<!-- Section header with title and optional edit button -->
<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils'

interface Props {
  title: string
  icon?: Component
  editable?: boolean
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <div
    :class="cn('group flex items-center justify-between gap-2 mb-2', props.class)"
    data-slot="section-header"
  >
    <h3 class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <component
        :is="props.icon"
        v-if="props.icon"
        class="size-4"
      />
      {{ props.title }}
    </h3>
    <div class="flex items-center gap-1">
      <slot name="actions" />
      <Button
        v-if="props.editable"
        variant="ghost"
        size="icon-sm"
        class="p-0.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-primary"
        :aria-label="`Edit ${props.title}`"
        @click="emit('edit')"
      >
        <Icon
          icon="icon-[mdi--pencil-outline]"
          class="size-3.5"
        />
      </Button>
    </div>
  </div>
</template>
