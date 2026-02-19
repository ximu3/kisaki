<script setup lang="ts">
import { Toaster as VueSonner } from 'vue-sonner'
import { useThemeStore } from '@renderer/stores/theme'

interface Props {
  expand?: boolean
  closeButton?: boolean
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'
  swipeDirections?: Array<'top' | 'right' | 'bottom' | 'left'>
}

const props = withDefaults(defineProps<Props>(), {
  expand: false,
  closeButton: false,
  position: 'bottom-right',
  swipeDirections: () => []
})

const themeStore = useThemeStore()
</script>

<template>
  <VueSonner
    :theme="themeStore.resolvedTheme"
    :expand="props.expand"
    :close-button="props.closeButton"
    :position="props.position"
    :swipe-directions="props.swipeDirections"
    close-button-position="top-right"
    :toast-options="{
      classes: {
        toast:
          '!font-sans !bg-popover !text-popover-foreground !shadow-xs !rounded-lg !pointer-events-auto',
        closeButton:
          '!border-0 !right-2 !top-2 !bg-transparent !text-muted-foreground !hover:text-accent-foreground'
      }
    }"
  >
    <template #success-icon>
      <span class="icon-[mdi--check-circle-outline] size-5" />
    </template>
    <template #error-icon>
      <span class="icon-[mdi--alert-circle-outline] size-5" />
    </template>
    <template #info-icon>
      <span class="icon-[mdi--information-outline] size-5" />
    </template>
    <template #warning-icon>
      <span class="icon-[mdi--alert-outline] size-5" />
    </template>
  </VueSonner>
</template>
