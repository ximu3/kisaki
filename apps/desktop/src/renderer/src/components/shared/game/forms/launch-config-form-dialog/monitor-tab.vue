<!--
  GameLaunchConfigMonitorTab
  Monitor configuration tab content with monitor mode and path settings.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { ipcManager } from '@renderer/core/ipc'
import { GameMonitorMode } from '@shared/db'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@renderer/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'

interface Props {
  effectiveMonitorPath: string | null
}

const props = defineProps<Props>()

const monitorMode = defineModel<GameMonitorMode>('monitorMode', { required: true })
const monitorPath = defineModel<string>('monitorPath', { required: true })

const MONITOR_MODE_OPTIONS: { value: GameMonitorMode; label: string; description: string }[] = [
  { value: 'folder', label: '文件夹', description: '监视目录内的所有进程' },
  { value: 'file', label: '文件', description: '监视指定的可执行文件' },
  { value: 'process', label: '进程名', description: '监视指定名称的进程' }
]

async function handleSelectMonitorPath() {
  const result = await ipcManager.invoke('native:open-dialog', {
    properties: [monitorMode.value === 'file' ? 'openFile' : 'openDirectory']
  })
  if (result.success && result.data && !result.data.canceled && result.data.filePaths[0]) {
    monitorPath.value = result.data.filePaths[0]
  }
}
</script>

<template>
  <FieldGroup>
    <Field>
      <FieldLabel>监视模式</FieldLabel>
      <FieldContent>
        <Select v-model="monitorMode">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in MONITOR_MODE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FieldContent>
      <FieldDescription>
        {{ MONITOR_MODE_OPTIONS.find((o) => o.value === monitorMode)?.description }}
      </FieldDescription>
    </Field>

    <Field>
      <FieldLabel class="inline-flex items-center gap-1">
        {{ monitorMode === 'process' ? '进程名' : '监视路径' }}
        <Tooltip>
          <TooltipTrigger as-child>
            <Icon
              icon="icon-[mdi--help-circle-outline]"
              class="size-3.5 text-muted-foreground cursor-help"
            />
          </TooltipTrigger>
          <TooltipContent class="max-w-xs">
            <div class="space-y-1">
              <div class="font-medium">留空时自动推导</div>
              <div class="text-muted-foreground">
                <template v-if="monitorMode === 'folder'">
                  优先使用游戏目录，否则使用启动文件所在目录
                </template>
                <template v-else-if="monitorMode === 'file'"> 使用启动文件路径 </template>
                <template v-else> 从启动文件名提取，如 game.exe </template>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="monitorPath"
            placeholder="留空自动推导"
          />
          <Button
            v-if="monitorMode !== 'process'"
            type="button"
            variant="outline"
            size="icon"
            @click="handleSelectMonitorPath"
          >
            <Icon
              :icon="
                monitorMode === 'file'
                  ? 'icon-[mdi--file-outline]'
                  : 'icon-[mdi--folder-open-outline]'
              "
              class="size-4"
            />
          </Button>
        </div>
      </FieldContent>
      <FieldDescription v-if="!monitorPath && props.effectiveMonitorPath">
        将使用: {{ props.effectiveMonitorPath }}
      </FieldDescription>
    </Field>
  </FieldGroup>
</template>
