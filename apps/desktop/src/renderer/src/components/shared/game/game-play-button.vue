<!--
  GamePlayButton
  Universal game play/stop button that syncs with game monitor state.
  Automatically switches between play and stop states based on game running status.
-->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { useGameMonitorStore } from '@renderer/stores'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/utils'
import { cva } from 'class-variance-authority'

interface Props {
  gameId: string
  /** Display style */
  display?: 'icon' | 'labeled'
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show text label (only for labeled display) */
  showLabel?: boolean
  /** Custom labels */
  playLabel?: string
  stopLabel?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  display: 'labeled',
  size: 'md',
  showLabel: true,
  playLabel: '开始游戏',
  stopLabel: '停止游戏'
})

const gameMonitorStore = useGameMonitorStore()
const isRunning = computed(() => gameMonitorStore.isGameRunning(props.gameId))

const iconButtonVariants = cva('relative', {
  variants: {
    size: {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14'
    }
  },
  defaultVariants: { size: 'md' }
})

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }
  },
  defaultVariants: { size: 'md' }
})

const labeledButtonSize = computed(() => {
  if (props.size === 'lg') return 'lg'
  if (props.size === 'sm') return 'sm'
  return 'default'
})

async function handleClick(e: Event) {
  e.stopPropagation()
  e.preventDefault()

  try {
    if (isRunning.value) {
      const result = await ipcManager.invoke('launcher:kill-game', props.gameId)
      if (!result.success) {
        console.warn('[GamePlayButton] launcher:kill-game failed:', result.error)
        const message = result.error === 'Game is not running' ? '游戏未运行' : result.error
        notify.error('停止游戏失败', message)
        return
      }
    } else {
      const result = await ipcManager.invoke('launcher:launch-game', props.gameId)
      if (!result.success) {
        console.warn('[GamePlayButton] launcher:launch-game failed:', result.error)
        const message = result.error === 'Game not found' ? '游戏不存在' : result.error
        notify.error('启动游戏失败', message)
        return
      }
    }
  } catch (error) {
    console.error('[GamePlayButton] launcher call threw:', error)
    notify.error('操作失败')
  }
}
</script>

<template>
  <!-- Icon variant -->
  <div
    v-if="props.display === 'icon'"
    :class="cn(iconButtonVariants({ size: props.size }), props.class)"
  >
    <Button
      :variant="isRunning ? 'secondary' : 'default'"
      :class="
        cn(
          'rounded-full w-full h-full p-0',
          'transition-transform duration-200 ease-in-out hover:scale-120',
          isRunning ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary hover:bg-primary/80'
        )
      "
      @click="handleClick"
    >
      <Icon
        :icon="isRunning ? 'icon-[mdi--stop]' : 'icon-[mdi--play]'"
        :class="iconVariants({ size: props.size })"
      />
    </Button>
  </div>

  <!-- Labeled variant -->
  <Button
    v-else
    :variant="isRunning ? 'secondary' : 'default'"
    :size="labeledButtonSize"
    :class="cn('gap-1.5', props.class)"
    @click="handleClick"
  >
    <Icon
      :icon="isRunning ? 'icon-[mdi--stop]' : 'icon-[mdi--play]'"
      class="size-4"
    />
    <template v-if="props.showLabel">
      {{ isRunning ? props.stopLabel : props.playLabel }}
    </template>
  </Button>
</template>
