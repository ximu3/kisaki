<!-- SegmentedControl root component for controlled state switching -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsRoot, TabsList } from 'reka-ui'
import { cn } from '@renderer/utils'

interface Props {
  defaultValue?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const model = defineModel<string>()
</script>

<template>
  <TabsRoot
    v-model="model"
    :default-value="props.defaultValue"
    data-slot="segmented-control"
  >
    <TabsList
      :class="cn('inline-flex h-7 items-center gap-0.5 rounded-md bg-muted p-0.5', props.class)"
      data-slot="segmented-control-list"
    >
      <slot />
    </TabsList>
  </TabsRoot>
</template>
