<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Icon } from '@renderer/components/ui/icon'
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@renderer/utils'
import DialogOverlay from './dialog-overlay.vue'

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes['class']
      showCloseButton?: boolean
    }
  >(),
  {
    showCloseButton: true
  }
)
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'showCloseButton')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

function handleInteractOutside(event: Event) {
  event.preventDefault()
}

function handleCloseAutoFocus(event: Event) {
  // Prevent focus restoration to avoid scroll jumping when dialog closes
  event.preventDefault()
}
</script>

<template>
  <DialogPortal data-slot="dialog-portal">
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
          'bg-background border border-border rounded-md shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'duration-150',
          props.class
        )
      "
      @interact-outside="handleInteractOutside"
      @close-auto-focus="handleCloseAutoFocus"
    >
      <slot />
      <DialogClose
        v-if="props.showCloseButton"
        data-slot="dialog-close"
        class="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-1 focus:ring-primary flex items-center justify-center"
      >
        <Icon
          icon="icon-[mdi--close]"
          class="size-4"
        />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
