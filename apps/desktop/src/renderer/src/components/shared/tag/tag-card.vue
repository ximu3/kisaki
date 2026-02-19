<!--
  TagCard
  Pure display component for rendering a tag.
  Supports both 'card' (default) and 'button' variants.
  Click behavior is controlled by the caller via @click emit.
  Right-click shows context menu for both variants.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { cva } from 'class-variance-authority'
import { cn, getEntityIcon } from '@renderer/utils'
import { Badge } from '@renderer/components/ui/badge'
import { Button, type ButtonVariants } from '@renderer/components/ui/button'
import { TagContextMenu } from './menus'
import type { Tag as TagType } from '@shared/db'

const cardVariants = cva(
  'inline-flex items-center min-w-0 gap-1.5 rounded-md border font-medium transition-colors border-border bg-muted/50 text-foreground hover:bg-muted',
  {
    variants: {
      size: {
        xs: 'w-20 h-6 px-2 text-xs',
        sm: 'w-24 h-6 px-2 text-xs',
        md: 'w-32 h-7 px-2.5 text-sm',
        lg: 'w-40 h-8 px-3 text-sm',
        xl: 'w-48 h-9 px-3.5 text-base'
      },
      clickable: {
        true: 'cursor-pointer',
        false: ''
      }
    },
    defaultVariants: {
      size: 'md',
      clickable: false
    }
  }
)

const iconVariants = cva('', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3',
      md: 'size-3.5',
      lg: 'size-4',
      xl: 'size-4'
    }
  },
  defaultVariants: { size: 'md' }
})

const buttonCardVariants = cva('', {
  variants: {
    buttonVariant: {
      default: '',
      destructive: '',
      outline: '',
      secondary: '',
      ghost: '',
      link: 'h-auto p-0 shrink truncate',
      text: ''
    },
    buttonSize: {
      default: '',
      sm: '',
      xs: '',
      lg: '',
      icon: '',
      'icon-sm': '',
      'icon-xs': '',
      'icon-lg': ''
    }
  },
  compoundVariants: [
    { buttonVariant: 'secondary', buttonSize: 'sm', class: 'h-auto py-1 px-2' },
    { buttonVariant: 'ghost', buttonSize: 'sm', class: 'h-auto py-1 px-2' }
  ],
  defaultVariants: { buttonVariant: 'secondary', buttonSize: 'sm' }
})

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  tag: TagType
  variant?: 'card' | 'button'
  // Card variant props
  size?: CardSize
  badgeLabel?: string
  // Button variant props
  buttonVariant?: ButtonVariants['variant']
  buttonSize?: ButtonVariants['size']
  // Common
  clickable?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  size: 'md',
  buttonVariant: 'secondary',
  buttonSize: 'sm',
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <TagContextMenu :tag-id="props.tag.id">
    <!-- Card Variant -->
    <div
      v-if="props.variant === 'card'"
      :class="cn(cardVariants({ size: props.size, clickable: props.clickable }), props.class)"
      @click="emit('click')"
    >
      <Icon
        :icon="getEntityIcon('tag')"
        :class="iconVariants({ size: props.size })"
      />
      <span class="truncate flex-1 min-w-0">{{ props.tag.name }}</span>
      <Badge
        v-if="props.badgeLabel"
        variant="secondary"
        class="ml-1 text-[10px] px-1 py-0"
      >
        {{ props.badgeLabel }}
      </Badge>
    </div>

    <!-- Button Variant -->
    <Button
      v-else
      :variant="props.buttonVariant"
      :size="props.buttonSize"
      :class="
        cn(
          buttonCardVariants({
            buttonVariant: props.buttonVariant,
            buttonSize: props.buttonSize
          }),
          props.class
        )
      "
      :title="props.tag.name"
      @click="emit('click')"
    >
      {{ props.tag.name }}
    </Button>
  </TagContextMenu>
</template>
