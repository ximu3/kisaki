<!-- Field component with orientation variants -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/utils'

const fieldVariants = cva('group/field w-full gap-1.5 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: ['flex flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
      horizontal: [
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5',
        '[&>.sr-only]:col-span-2 [&>.sr-only]:w-auto',
        '[&>[data-slot=field-label]]:col-start-1 [&>[data-slot=field-label]]:row-start-1',
        '[&>[data-slot=field-description]]:col-start-1 [&>[data-slot=field-description]]:row-start-2',
        '[&>[data-slot=field-content]]:col-start-2 [&>[data-slot=field-content]]:row-start-1 [&>[data-slot=field-content]]:justify-self-end',
        'has-[>[data-slot=field-description]]:[&>[data-slot=field-content]]:row-span-2 has-[>[data-slot=field-description]]:[&>[data-slot=field-content]]:self-center',
        '[&>[role=checkbox],[role=radio],[role=switch]]:col-start-2 [&>[role=checkbox],[role=radio],[role=switch]]:row-start-1 [&>[role=checkbox],[role=radio],[role=switch]]:justify-self-end',
        'has-[>[data-slot=field-description]]:[&>[role=checkbox],[role=radio],[role=switch]]:row-span-2 has-[>[data-slot=field-description]]:[&>[role=checkbox],[role=radio],[role=switch]]:self-center'
      ],
      responsive: [
        'flex flex-col [&>*]:w-full [&>.sr-only]:w-auto',
        '@md/field-group:grid @md/field-group:grid-cols-[minmax(0,1fr)_auto] @md/field-group:items-center @md/field-group:gap-x-3 @md/field-group:gap-y-1 @md/field-group:[&>*]:w-auto',
        '@md/field-group:[&>.sr-only]:col-span-2 @md/field-group:[&>.sr-only]:w-auto',
        '@md/field-group:[&>[data-slot=field-label]]:col-start-1 @md/field-group:[&>[data-slot=field-label]]:row-start-1',
        '@md/field-group:[&>[data-slot=field-description]]:col-start-1 @md/field-group:[&>[data-slot=field-description]]:row-start-2',
        '@md/field-group:[&>[data-slot=field-content]]:col-start-2 @md/field-group:[&>[data-slot=field-content]]:row-start-1 @md/field-group:[&>[data-slot=field-content]]:justify-self-end',
        '@md/field-group:has-[>[data-slot=field-description]]:[&>[data-slot=field-content]]:row-span-2 @md/field-group:has-[>[data-slot=field-description]]:[&>[data-slot=field-content]]:self-center',
        '@md/field-group:[&>[role=checkbox],[role=radio],[role=switch]]:col-start-2 @md/field-group:[&>[role=checkbox],[role=radio],[role=switch]]:row-start-1 @md/field-group:[&>[role=checkbox],[role=radio],[role=switch]]:justify-self-end',
        '@md/field-group:has-[>[data-slot=field-description]]:[&>[role=checkbox],[role=radio],[role=switch]]:row-span-2 @md/field-group:has-[>[data-slot=field-description]]:[&>[role=checkbox],[role=radio],[role=switch]]:self-center'
      ]
    }
  },
  defaultVariants: {
    orientation: 'vertical'
  }
})

type FieldVariants = VariantProps<typeof fieldVariants>

interface Props {
  orientation?: FieldVariants['orientation']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'vertical'
})
</script>

<template>
  <div
    role="group"
    data-slot="field"
    :data-orientation="props.orientation"
    :class="cn(fieldVariants({ orientation: props.orientation }), props.class)"
  >
    <slot />
  </div>
</template>
