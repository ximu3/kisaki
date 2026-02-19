<!--
  GameCard
  Pure display component for rendering a game in lists/grids.
  Supports both 'card' (default) and 'button' variants.
  Click behavior is controlled by the caller via @click emit.
  Right-click shows context menu for both variants.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { cva } from 'class-variance-authority'
import { useGameMonitorStore } from '@renderer/stores'
import { cn, getAttachmentUrl, getEntityIcon } from '@renderer/utils'
import { Badge } from '@renderer/components/ui/badge'
import { Button, type ButtonVariants } from '@renderer/components/ui/button'
import { HoverScaleImage } from '@renderer/components/ui/hover-scale-image'
import { GameContextMenu } from './menus'
import type { Game } from '@shared/db'

const cardVariants = cva('group relative flex-shrink-0 flex flex-col', {
  variants: {
    size: {
      xs: 'w-20',
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-40',
      xl: 'w-48'
    }
  },
  defaultVariants: { size: 'md' }
})

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type CardAlign = 'left' | 'center' | 'right'

const alignStyles: Record<CardAlign, { container: string; text: string }> = {
  left: { container: 'items-start', text: 'text-left' },
  center: { container: 'items-center', text: 'text-center' },
  right: { container: 'items-end', text: 'text-right' }
}

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
    // Only apply size padding for non-link variants
    { buttonVariant: 'secondary', buttonSize: 'sm', class: 'h-auto py-1 px-2' },
    { buttonVariant: 'ghost', buttonSize: 'sm', class: 'h-auto py-1 px-2' }
  ],
  defaultVariants: { buttonVariant: 'secondary', buttonSize: 'sm' }
})

interface Props {
  game: Game
  variant?: 'card' | 'button'
  // Card variant props
  size?: CardSize
  hideName?: boolean
  badgeLabel?: string
  align?: CardAlign
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
  align: 'center',
  buttonVariant: 'secondary',
  buttonSize: 'sm',
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()

const alignStyle = computed(() => alignStyles[props.align])
const gameMonitorStore = useGameMonitorStore()
const isRunning = computed(() => gameMonitorStore.isGameRunning(props.game.id))

const imageUrl = computed(() =>
  props.game.coverFile
    ? getAttachmentUrl('games', props.game.id, props.game.coverFile, { width: 300, height: 400 })
    : null
)
</script>

<template>
  <GameContextMenu :game-id="props.game.id">
    <!-- Card Variant -->
    <div
      v-if="props.variant === 'card'"
      :class="
        cn(cardVariants({ size: props.size }), props.clickable && 'cursor-pointer', props.class)
      "
      @click="emit('click')"
    >
      <div class="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border shadow-sm">
        <HoverScaleImage class="size-full">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="props.game.name"
            loading="lazy"
            decoding="async"
            class="size-full object-cover"
          />
          <div
            v-else
            class="size-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50"
          >
            <Icon
              :icon="getEntityIcon('game')"
              class="size-8 text-muted-foreground/50"
            />
          </div>
        </HoverScaleImage>

        <!-- Running indicator -->
        <div
          v-if="isRunning"
          class="absolute top-1 right-1 size-2 rounded-full bg-success animate-pulse"
        />
      </div>

      <!-- Content with badge -->
      <template v-if="props.badgeLabel">
        <div :class="cn('mt-1.5 flex flex-col w-full', alignStyle.container)">
          <p
            :class="cn('text-xs font-medium truncate w-full px-1 hover:underline', alignStyle.text)"
          >
            {{ props.game.name }}
          </p>
          <Badge
            variant="secondary"
            class="mt-1 text-[10px] px-1.5 py-0"
          >
            {{ props.badgeLabel }}
          </Badge>
        </div>
      </template>

      <!-- Content without badge -->
      <p
        v-else-if="!props.hideName"
        :class="
          cn(
            'mt-1.5 text-xs font-medium truncate w-full text-foreground/90 hover:underline',
            alignStyle.text
          )
        "
      >
        {{ props.game.name }}
      </p>
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
      :title="props.game.name"
      @click="emit('click')"
    >
      {{ props.game.name }}
    </Button>
  </GameContextMenu>
</template>
