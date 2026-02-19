<!--
  Sidebar
  Desktop-style sidebar navigation with icon buttons.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator
} from '@renderer/components/ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '@renderer/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { usePreferencesStore, useThemeStore } from '@renderer/stores'
import SidebarNavItem from './sidebar-nav-item.vue'
import { AdderTrigger } from '@renderer/features/adder'
import { ScraperProfilesFormDialog } from '@renderer/features/scraper'
import { SettingsFormDialog } from '@renderer/features/settings'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

const navItems: NavItem[] = [
  { id: 'library', label: '媒体库', icon: 'icon-[mdi--bookshelf]', path: '/library' },
  { id: 'statistics', label: '统计', icon: 'icon-[mdi--chart-box-outline]', path: '/statistics' },
  { id: 'scanner', label: '扫描器', icon: 'icon-[mdi--folder-search-outline]', path: '/scanner' },
  { id: 'plugin', label: '插件', icon: 'icon-[mdi--puzzle-outline]', path: '/plugin' }
]

// Plugin sidebar items from new extension registry
const pluginItems = uiExtensions.sidebar.nav.items
const isSettingsOpen = ref(false)
const isProfileManagerOpen = ref(false)

// Preferences
const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

// Theme mode (light/dark/system lives in sidebar dropdown)
const themeStore = useThemeStore()
const { mode } = storeToRefs(themeStore)

const isNsfwConfirmOpen = ref(false)
const pendingShowNsfw = ref<boolean | null>(null)

watch(isNsfwConfirmOpen, (open) => {
  if (open) return
  pendingShowNsfw.value = null
})

function handleNsfwConfirm() {
  if (pendingShowNsfw.value === null) return
  preferencesStore.setShowNsfw(pendingShowNsfw.value)
  isNsfwConfirmOpen.value = false
}

const showNsfwModel = computed({
  get: () => showNsfw.value,
  set: (checked: boolean | undefined) => {
    if (checked === undefined) return
    if (checked === showNsfw.value) return

    pendingShowNsfw.value = checked
    isNsfwConfirmOpen.value = true
  }
})
</script>

<template>
  <aside class="flex flex-col h-full w-13 bg-surface border-r border-border shrink-0">
    <!-- Main navigation -->
    <nav class="flex-1 flex flex-col items-center py-2 gap-1">
      <SidebarNavItem
        v-for="item in navItems"
        :key="item.id"
        :item="item"
      />
      <!-- Plugin sidebar items -->
      <SidebarNavItem
        v-for="item in pluginItems"
        :key="item.id"
        :item="{
          id: item.id,
          label: item.label,
          icon: item.icon || 'icon-[mdi--puzzle-outline]',
          path: item.path
        }"
      />
    </nav>

    <!-- Bottom navigation -->
    <nav class="flex flex-col items-center py-2 gap-1">
      <AdderTrigger />

      <!-- Settings Dropdown -->
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger as-child>
            <DropdownMenuTrigger as-child>
              <button
                :class="
                  cn(
                    'flex items-center justify-center size-10 rounded-md transition-colors',
                    'text-surface-foreground hover:text-accent-foreground hover:bg-accent',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
                  )
                "
              >
                <Icon
                  icon="icon-[mdi--cog-outline]"
                  class="size-5"
                />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            :side-offset="8"
          >
            设置
          </TooltipContent>

          <DropdownMenuContent
            side="right"
            align="end"
            :side-offset="8"
            class="w-48"
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icon
                  icon="icon-[mdi--weather-sunset]"
                  class="size-4"
                />
                <span>主题模式</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent
                side="right"
                align="start"
                class="w-40"
              >
                <DropdownMenuRadioGroup v-model="mode">
                  <DropdownMenuRadioItem value="light">
                    <Icon
                      icon="icon-[mdi--weather-sunny]"
                      class="size-4"
                    />
                    <span>浅色</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Icon
                      icon="icon-[mdi--weather-night]"
                      class="size-4"
                    />
                    <span>深色</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Icon
                      icon="icon-[mdi--laptop]"
                      class="size-4"
                    />
                    <span>跟随系统</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuCheckboxItem v-model="showNsfwModel">
              <Icon
                icon="icon-[mdi--coffee-outline]"
                class="size-4"
              />
              <span>显示 NSFW 内容</span>
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem @select="isProfileManagerOpen = true">
              <Icon
                icon="icon-[mdi--database-cog-outline]"
                class="size-4"
              />
              <span>刮削配置</span>
            </DropdownMenuItem>

            <DropdownMenuItem @select="isSettingsOpen = true">
              <Icon
                icon="icon-[mdi--power-settings-new]"
                class="size-4"
              />
              <span>软件设置</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </nav>
  </aside>

  <!-- Profile Manager Dialog -->
  <ScraperProfilesFormDialog
    v-if="isProfileManagerOpen"
    v-model:open="isProfileManagerOpen"
  />

  <SettingsFormDialog
    v-if="isSettingsOpen"
    v-model:open="isSettingsOpen"
  />

  <AlertDialog v-model:open="isNsfwConfirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ pendingShowNsfw ? '显示 NSFW 内容？' : '隐藏 NSFW 内容？' }}
        </AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>
        <p v-if="pendingShowNsfw">开启后将显示被标记为 NSFW 的内容。</p>
        <p v-else>关闭后将隐藏被标记为 NSFW 的内容。</p>
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction @click="handleNsfwConfirm">确认</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
