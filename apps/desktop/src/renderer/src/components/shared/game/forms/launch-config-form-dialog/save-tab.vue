<!--
  GameLaunchConfigSaveTab
  Save configuration tab content with save path and max backups settings.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { ipcManager } from '@renderer/core/ipc'
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

const savePath = defineModel<string>('savePath', { required: true })
const maxSaveBackups = defineModel<number>('maxSaveBackups', { required: true })

const MAX_BACKUPS_OPTIONS = [1, 3, 5, 10, 20, 50]

// Computed model to convert between number and string
const maxBackupsModel = computed({
  get: () => String(maxSaveBackups.value),
  set: (v: string) => {
    maxSaveBackups.value = Number(v)
  }
})

async function handleSelectSavePath() {
  const result = await ipcManager.invoke('native:open-dialog', {
    properties: ['openDirectory']
  })
  if (result.success && result.data && !result.data.canceled && result.data.filePaths[0]) {
    savePath.value = result.data.filePaths[0]
  }
}
</script>

<template>
  <FieldGroup>
    <Field>
      <FieldLabel>存档路径</FieldLabel>
      <FieldContent>
        <div class="flex gap-2">
          <Input
            v-model="savePath"
            placeholder="未设置"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            @click="handleSelectSavePath"
          >
            <Icon
              icon="icon-[mdi--folder-open-outline]"
              class="size-4"
            />
          </Button>
        </div>
      </FieldContent>
      <FieldDescription>用于自动备份的存档目录</FieldDescription>
    </Field>

    <Field orientation="horizontal">
      <FieldLabel>最大备份数</FieldLabel>
      <FieldDescription>超过此数量时自动删除最旧的备份</FieldDescription>
      <FieldContent>
        <Select v-model="maxBackupsModel">
          <SelectTrigger class="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="n in MAX_BACKUPS_OPTIONS"
              :key="n"
              :value="String(n)"
            >
              {{ n }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FieldContent>
    </Field>
  </FieldGroup>
</template>
