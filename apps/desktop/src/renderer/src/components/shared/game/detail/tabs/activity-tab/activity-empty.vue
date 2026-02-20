<!--
  Game Detail Activity Empty State

  Displayed when there are no play sessions for the game.
-->

<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <Icon
      icon="icon-[mdi--report-timeline-variant]"
      class="size-12 text-muted-foreground/30 mb-3"
    />
    <p class="text-sm text-muted-foreground font-medium mb-1">暂无游玩活动</p>
    <p class="text-xs text-muted-foreground/70 max-w-xs">启动游戏后，游玩时间将自动记录在这里</p>
  </div>
</template>
