<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'
import { ipcManager } from '@renderer/core/ipc'

const rootEl = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null
let raf = 0

async function handleQuitClick() {
  await ipcManager.invoke('app:quit')
}

function postTrayMenuHeight() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const el = rootEl.value
    if (!el) return
    const height = Math.ceil(el.getBoundingClientRect().height)
    ipcManager.send('native:set-tray-menu-height', height)
  })
}

onMounted(() => {
  postTrayMenuHeight()
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => postTrayMenuHeight())
  if (rootEl.value) {
    resizeObserver.observe(rootEl.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="rootEl"
    class="w-full h-full bg-popover text-popover-foreground p-1.5"
  >
    <Button
      variant="ghost"
      class="w-full justify-start"
      @click="handleQuitClick"
    >
      <Icon
        icon="icon-[mdi--power]"
        class="size-4"
      />
      <span>退出 Kisaki</span>
    </Button>
  </div>
</template>
