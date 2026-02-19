<!-- Spinner loading component -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <Icon
    icon="icon-[mdi--loading]"
    :class="cn('animate-spin', props.class)"
    role="status"
    aria-label="Loading"
    data-slot="spinner"
  />
</template>
