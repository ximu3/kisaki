<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@renderer/utils'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'

interface Props {
  class?: HTMLAttributes['class']
  imageUrl?: string | null
  imageAlt?: string
  pickedPath?: string | null
  pickedPathPrefix?: string
  pickLabel?: string
  pickIcon?: string
  clearLabel?: string
  pickDisabled?: boolean
  clearDisabled?: boolean
  previewMaxHeightClass?: string
  showPickedPath?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  imageAlt: '',
  pickedPath: null,
  pickedPathPrefix: '已选择：',
  pickLabel: '选择图片',
  pickIcon: 'icon-[mdi--image-outline]',
  clearLabel: '清除',
  pickDisabled: false,
  clearDisabled: false,
  previewMaxHeightClass: 'max-h-[220px]',
  showPickedPath: true
})

const emit = defineEmits<{
  pick: []
  clear: []
}>()

function handlePick() {
  emit('pick')
}

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    data-slot="image-picker"
  >
    <div
      v-if="props.imageUrl"
      class="rounded-lg overflow-hidden border bg-muted"
    >
      <img
        :src="props.imageUrl"
        :alt="props.imageAlt"
        :class="cn('w-full object-contain', props.previewMaxHeightClass)"
      />
    </div>

    <div
      v-else-if="props.showPickedPath && props.pickedPath"
      class="text-xs text-muted-foreground border rounded-md p-2"
    >
      {{ props.pickedPathPrefix }}{{ props.pickedPath }}
    </div>

    <div class="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        :disabled="props.pickDisabled"
        @click="handlePick"
      >
        <Icon
          :icon="props.pickIcon"
          class="size-4 mr-1.5"
        />
        {{ props.pickLabel }}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="props.clearDisabled"
        @click="handleClear"
      >
        {{ props.clearLabel }}
      </Button>

      <slot name="actions" />
    </div>
  </div>
</template>
