<script setup lang="ts">
/**
 * Browse Plugin Card (Grid cell style)
 *
 * Card for plugin discovery with divider line borders.
 * Uses standard PluginRegistryEntry fields - no registry-specific handling.
 */

import { ref } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { cn } from '@renderer/utils/cn'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import type { PluginRegistryEntry } from '@shared/plugin'

interface Props {
  plugin: PluginRegistryEntry
}

const props = defineProps<Props>()

const installing = ref(false)
const installed = ref(false)
const iconError = ref(false)

async function handleInstall() {
  installing.value = true
  try {
    const source = `github:${props.plugin.id}`
    const res = await ipcManager.invoke('plugin:install', source)
    if (!res.success) {
      notify.error('安装失败', res.error)
      return
    }

    notify.success('插件安装成功')
    installed.value = true
  } catch (error) {
    console.error('Install failed:', error)
    notify.error('安装失败', (error as Error).message)
  } finally {
    installing.value = false
  }
}
</script>

<template>
  <div :class="cn('flex flex-col p-4 border-r border-b', 'hover:bg-accent/50 transition-colors')">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2">
      <img
        v-if="props.plugin.iconUrl && !iconError"
        :src="props.plugin.iconUrl"
        alt=""
        class="size-5 rounded shrink-0 border shadow-xs"
        @error="iconError = true"
      />
      <Icon
        v-else
        icon="icon-[mdi--puzzle-outline]"
        class="size-5 text-muted-foreground shrink-0"
      />
      <h3 class="text-sm font-medium truncate flex-1">{{ props.plugin.name }}</h3>
      <span class="text-[10px] text-muted-foreground/70 px-1.5 py-0.5 bg-muted/30 rounded">
        v{{ props.plugin.version }}
      </span>
    </div>

    <!-- Meta - only author -->
    <div class="text-xs text-muted-foreground mb-2">{{ props.plugin.author || '未知' }}</div>

    <!-- Description -->
    <p class="text-xs text-muted-foreground/70 line-clamp-2 flex-1 mb-3">
      {{ props.plugin.description || '无描述' }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 text-xs text-muted-foreground">
        <span
          v-if="props.plugin.stars !== undefined"
          class="flex items-center gap-1"
        >
          <Icon
            icon="icon-[mdi--starburst-outline]"
            class="size-3.5"
          />
          {{ props.plugin.stars }}
        </span>
        <a
          v-if="props.plugin.homepage"
          :href="props.plugin.homepage"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon
            icon="icon-[mdi--open-in-new]"
            class="size-3"
          />
          主页
        </a>
      </div>

      <Button
        size="sm"
        :variant="installed ? 'ghost' : 'default'"
        :disabled="installing || installed"
        @click="handleInstall"
      >
        <Spinner
          v-if="installing"
          class="size-3"
        />
        <template v-else-if="installed">
          <Icon
            icon="icon-[mdi--check]"
            class="size-3.5"
          />
          已安装
        </template>
        <template v-else>
          <Icon
            icon="icon-[mdi--download]"
            class="size-3.5"
          />
          安装
        </template>
      </Button>
    </div>
  </div>
</template>
