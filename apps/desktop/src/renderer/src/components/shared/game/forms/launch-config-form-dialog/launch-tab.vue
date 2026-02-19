<!--
  GameLaunchConfigLaunchTab
  Launch configuration tab content with game directory, launcher mode, and path settings.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { ipcManager } from '@renderer/core/ipc'
import { GameLauncherMode } from '@shared/db'
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

const gameDirPath = defineModel<string>('gameDirPath', { required: true })
const launcherMode = defineModel<GameLauncherMode>('launcherMode', { required: true })
const launcherPath = defineModel<string>('launcherPath', { required: true })

const LAUNCHER_MODE_OPTIONS: { value: GameLauncherMode; label: string; description: string }[] = [
  { value: 'file', label: '文件', description: '直接运行可执行文件' },
  { value: 'url', label: '链接', description: '通过 URL 协议启动（如 steam://）' },
  { value: 'exec', label: '命令', description: '执行命令行指令' }
]

async function handleSelectGameDirPath() {
  const result = await ipcManager.invoke('native:open-dialog', {
    properties: ['openDirectory']
  })
  if (result.success && result.data && !result.data.canceled && result.data.filePaths[0]) {
    gameDirPath.value = result.data.filePaths[0]
  }
}

async function handleSelectLauncherPath() {
  const result = await ipcManager.invoke('native:open-dialog', {
    properties: ['openFile']
  })
  if (result.success && result.data && !result.data.canceled && result.data.filePaths[0]) {
    launcherPath.value = result.data.filePaths[0]
  }
}
</script>

<template>
  <FieldGroup>
    <Field>
      <FieldLabel>游戏目录</FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="gameDirPath"
            placeholder="未设置"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            @click="handleSelectGameDirPath"
          >
            <Icon
              icon="icon-[mdi--folder-open-outline]"
              class="size-4"
            />
          </Button>
        </div>
      </FieldContent>
      <FieldDescription>用于自动推导和命令模式下的工作目录</FieldDescription>
    </Field>

    <Field>
      <FieldLabel>启动模式</FieldLabel>
      <FieldContent>
        <Select v-model="launcherMode">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="option in LAUNCHER_MODE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FieldContent>
      <FieldDescription>
        {{ LAUNCHER_MODE_OPTIONS.find((o) => o.value === launcherMode)?.description }}
      </FieldDescription>
    </Field>

    <Field>
      <FieldLabel>
        {{
          launcherMode === 'url' ? '启动链接' : launcherMode === 'exec' ? '启动命令' : '启动文件'
        }}
      </FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="launcherPath"
            :placeholder="launcherMode === 'url' ? '例如: steam://rungameid/123' : '未设置'"
          />
          <Button
            v-if="launcherMode === 'file'"
            type="button"
            variant="outline"
            size="icon"
            @click="handleSelectLauncherPath"
          >
            <Icon
              icon="icon-[mdi--file-outline]"
              class="size-4"
            />
          </Button>
        </div>
      </FieldContent>
    </Field>

  </FieldGroup>
</template>
