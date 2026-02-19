<!-- FieldSet component - semantic fieldset wrapper -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <fieldset
    data-slot="field-set"
    :class="
      cn(
        'flex flex-col gap-6',
        'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        props.class
      )
    "
  >
    <slot />
  </fieldset>
</template>
