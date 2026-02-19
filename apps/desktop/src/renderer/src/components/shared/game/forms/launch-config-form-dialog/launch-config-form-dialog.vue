<!--
  GameLaunchConfigFormDialog
  Dialog for editing game launch configuration including launcher, monitor, and save settings.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { games, GameLauncherMode, GameMonitorMode } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Spinner } from '@renderer/components/ui/spinner'
import { notify } from '@renderer/core/notify'
import GameLaunchConfigLaunchTab from './launch-tab.vue'
import GameLaunchConfigMonitorTab from './monitor-tab.vue'
import GameLaunchConfigSaveTab from './save-tab.vue'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

// Form state
const gameDirPath = ref('')
const launcherMode = ref<GameLauncherMode>('file')
const launcherPath = ref('')
const monitorMode = ref<GameMonitorMode>('folder')
const monitorPath = ref('')
const savePath = ref('')
const maxSaveBackups = ref(5)
const isSaving = ref(false)
const effectiveMonitorPath = ref<string | null>(null)

// Fetch game data when dialog opens
const { data: game, isLoading } = useAsyncData(
  () => db.query.games.findFirst({ where: eq(games.id, props.gameId) }),
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Initialize form state when data loads
watch(game, (gameData) => {
  if (gameData) {
    gameDirPath.value = gameData.gameDirPath || ''
    launcherMode.value = gameData.launcherMode
    launcherPath.value = gameData.launcherPath || ''
    monitorMode.value = gameData.monitorMode
    monitorPath.value = gameData.monitorPath || ''
    savePath.value = gameData.savePath || ''
    maxSaveBackups.value = gameData.maxSaveBackups
  }
})

// Compute effective monitor path for preview when config changes
watch(
  [monitorPath, monitorMode, gameDirPath, launcherMode, launcherPath],
  async () => {
    const result = await ipcManager.invoke('monitor:compute-effective-path', {
      monitorPath: monitorPath.value || null,
      monitorMode: monitorMode.value,
      gameDirPath: gameDirPath.value || null,
      launcherMode: launcherMode.value,
      launcherPath: launcherPath.value || null
    })
    if (result.success) {
      effectiveMonitorPath.value = result.data
    }
  },
  { immediate: true }
)

async function handleSave() {
  isSaving.value = true
  try {
    await db
      .update(games)
      .set({
        gameDirPath: gameDirPath.value || null,
        launcherMode: launcherMode.value,
        launcherPath: launcherPath.value || null,
        monitorMode: monitorMode.value,
        monitorPath: monitorPath.value || null,
        savePath: savePath.value || null,
        maxSaveBackups: maxSaveBackups.value
      })
      .where(eq(games.id, props.gameId))

    notify.success('启动配置已保存')
    open.value = false
  } catch {
    notify.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg">
      <!-- Loading state -->
      <template v-if="isLoading || !game">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <!-- Form content -->
      <template v-else>
        <DialogHeader>
          <DialogTitle>启动配置</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Tabs
            default-value="launch"
            class="w-full"
          >
            <TabsList>
              <TabsTrigger value="launch">
                <Icon
                  icon="icon-[mdi--play-circle-outline]"
                  class="size-3.5"
                />
                启动
              </TabsTrigger>
              <TabsTrigger value="monitor">
                <Icon
                  icon="icon-[mdi--eye-outline]"
                  class="size-3.5"
                />
                监视
              </TabsTrigger>
              <TabsTrigger value="save">
                <Icon
                  icon="icon-[mdi--content-save-outline]"
                  class="size-3.5"
                />
                存档
              </TabsTrigger>
            </TabsList>

            <TabsContent value="launch">
              <GameLaunchConfigLaunchTab
                v-model:game-dir-path="gameDirPath"
                v-model:launcher-mode="launcherMode"
                v-model:launcher-path="launcherPath"
              />
            </TabsContent>

            <TabsContent value="monitor">
              <GameLaunchConfigMonitorTab
                v-model:monitor-mode="monitorMode"
                v-model:monitor-path="monitorPath"
                :effective-monitor-path="effectiveMonitorPath"
              />
            </TabsContent>

            <TabsContent value="save">
              <GameLaunchConfigSaveTab
                v-model:save-path="savePath"
                v-model:max-save-backups="maxSaveBackups"
              />
            </TabsContent>
          </Tabs>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            @click="handleCancel"
          >
            取消
          </Button>
          <Button
            :disabled="isSaving"
            @click="handleSave"
          >
            <template v-if="isSaving">
              <Icon
                icon="icon-[mdi--loading]"
                class="size-4 animate-spin"
              />
              保存中...
            </template>
            <template v-else> 保存 </template>
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>
