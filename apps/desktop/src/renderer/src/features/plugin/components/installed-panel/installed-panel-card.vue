<script setup lang="ts">
/**
 * Installed Plugin Card (Grid cell style)
 *
 * Card for installed plugin management with divider line borders.
 * Uses fixed icon.png convention - checks ${directory}/icon.png
 */

import { ref, computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { Badge } from '@renderer/components/ui/badge'
import { Spinner } from '@renderer/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/utils/cn'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { uiExtensions } from '@renderer/core/ui-extensions'
import type { InstalledPluginInfo, PluginUpdateInfo } from '@shared/plugin'

interface Props {
  plugin: InstalledPluginInfo
  updateInfo?: PluginUpdateInfo
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggling = ref(false)
const uninstalling = ref(false)
const updating = ref(false)
const iconError = ref(false)
const settingsOpen = ref(false)

// Get settings dialog from extension registry
const settingsDialog = computed(() => uiExtensions.settings.plugins.dialogs.get(props.plugin.id))

// Check if plugin has settings dialog registered
const hasSettings = computed(() => {
  return !!settingsDialog.value
})

// Fixed icon.png convention - construct file:// URL
const iconUrl = computed(() => {
  if (!props.plugin.directory) return undefined
  const fullPath = `${props.plugin.directory}/icon.png`.replace(/\\/g, '/')
  return `file://${fullPath}`
})

async function handleToggle(enabled: boolean) {
  toggling.value = true
  try {
    const channel = enabled ? 'plugin:enable' : 'plugin:disable'
    const res = await ipcManager.invoke(channel, props.plugin.id)
    if (!res.success) {
      notify.error('操作失败', res.error)
      return
    }

    notify.success(enabled ? '插件已启用' : '插件已禁用')
    emit('refresh')
  } catch (error) {
    console.error('Toggle failed:', error)
    notify.error('操作失败', (error as Error).message)
  } finally {
    toggling.value = false
  }
}

// Computed model for plugin enabled state
const enabledModel = computed({
  get: () => props.plugin.enabled,
  set: (v: boolean) => handleToggle(v)
})

async function handleUninstall() {
  uninstalling.value = true
  try {
    const res = await ipcManager.invoke('plugin:uninstall', props.plugin.id)
    if (!res.success) {
      notify.error('卸载失败', res.error)
      return
    }

    notify.success('插件已卸载')
    emit('refresh')
  } catch (error) {
    console.error('Uninstall failed:', error)
    notify.error('卸载失败', (error as Error).message)
  } finally {
    uninstalling.value = false
  }
}

async function handleUpdate() {
  updating.value = true
  try {
    const res = await ipcManager.invoke('plugin:update', props.plugin.id)
    if (!res.success) {
      notify.error('更新失败', res.error)
      return
    }

    notify.success('插件更新成功')
    emit('refresh')
  } catch (error) {
    console.error('Update failed:', error)
    notify.error('更新失败', (error as Error).message)
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col p-4 border-r border-b',
        'hover:bg-accent/50 transition-colors',
        !props.plugin.enabled && 'opacity-50'
      )
    "
  >
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2">
      <img
        v-if="iconUrl && !iconError"
        :src="iconUrl"
        alt=""
        class="size-5 rounded shrink-0 border shadow-xs"
        @error="iconError = true"
      />
      <Icon
        v-else
        icon="icon-[mdi--puzzle-outline]"
        class="size-5 text-primary shrink-0"
      />
      <h3 class="text-sm font-medium truncate flex-1">{{ props.plugin.name }}</h3>
      <span class="text-[10px] text-muted-foreground/70 px-1.5 py-0.5 bg-muted/30 rounded">
        v{{ props.plugin.version }}
      </span>
      <Badge
        v-if="props.updateInfo"
        variant="default"
        class="text-[10px] px-1.5 py-0 h-4"
      >
        更新
      </Badge>
    </div>

    <!-- Meta -->
    <div class="text-xs text-muted-foreground mb-2">{{ props.plugin.author || '未知' }}</div>

    <!-- Description -->
    <p class="text-xs text-muted-foreground/70 line-clamp-2 flex-1 mb-3">
      {{ props.plugin.description || '无描述' }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <!-- Enable/Disable -->
      <div class="flex items-center gap-2">
        <Switch
          v-model="enabledModel"
          :disabled="toggling"
          class="scale-90"
        />
        <span class="text-xs text-muted-foreground">
          {{ props.plugin.enabled ? '启用' : '禁用' }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <Button
          v-if="props.updateInfo"
          size="sm"
          variant="default"
          :disabled="updating"
          @click="handleUpdate"
        >
          <Spinner
            v-if="updating"
            class="size-3"
          />
          <Icon
            v-else
            icon="icon-[mdi--refresh]"
            class="size-3.5"
          />
          更新
        </Button>
        <Tooltip v-if="hasSettings">
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="ghost"
              @click="settingsOpen = true"
            >
              <Icon
                icon="icon-[mdi--cog-outline]"
                class="size-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>设置</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="ghost"
              :disabled="uninstalling"
              class="hover:text-destructive"
              @click="handleUninstall"
            >
              <Spinner
                v-if="uninstalling"
                class="size-3"
              />
              <Icon
                v-else
                icon="icon-[mdi--delete-outline]"
                class="size-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>卸载</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <!-- Settings Dialog -->
    <component
      :is="settingsDialog?.component"
      v-if="settingsOpen && settingsDialog"
      v-model:open="settingsOpen"
    />
  </div>
</template>
