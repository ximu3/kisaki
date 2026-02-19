<!--
  GameDetailSavesItem
  Single backup item component showing backup info with action buttons.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { Button } from '@renderer/components/ui/button'
import { formatDate } from '@renderer/utils'

interface Props {
  note: string
  backupAt: number
  sizeBytes?: number
  locked: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  restore: []
  edit: []
  delete: []
}>()

function formatSize(bytes?: number): string {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>

<template>
  <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
    <div class="flex items-center gap-3 min-w-0">
      <Icon
        icon="icon-[mdi--content-save-outline]"
        class="size-5 text-muted-foreground shrink-0"
      />
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium truncate">
            {{ props.note || formatDate(new Date(props.backupAt)) }}
          </p>
          <Icon
            v-if="props.locked"
            icon="icon-[mdi--lock-outline]"
            class="size-3.5 text-warning shrink-0"
          />
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ formatDateTime(new Date(props.backupAt)) }}</span>
          <template v-if="props.sizeBytes">
            <span>·</span>
            <span>{{ formatSize(props.sizeBytes) }}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            @click="emit('restore')"
          >
            <Icon
              icon="icon-[mdi--rotate-left]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>恢复</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            @click="emit('edit')"
          >
            <Icon
              icon="icon-[mdi--pencil-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>编辑</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            class="hover:text-destructive"
            @click="emit('delete')"
          >
            <Icon
              icon="icon-[mdi--delete-outline]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>删除</TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>
