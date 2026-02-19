<!--
  GameDetailNotesItem
  Single note item component showing note info with action buttons.
-->
<script setup lang="ts">
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import type { GameNote } from '@shared/db'
import { formatDate, getAttachmentUrl } from '@renderer/utils'

interface Props {
  note: GameNote
  canMoveUp: boolean
  canMoveDown: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  open: []
  moveUp: []
  moveDown: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border">
    <div class="flex items-center gap-3 min-w-0">
      <div class="size-12 rounded-md overflow-hidden bg-muted shrink-0">
        <img
          v-if="props.note.coverFile"
          :src="
            getAttachmentUrl('game_notes', props.note.id, props.note.coverFile, {
              width: 96,
              height: 96
            })
          "
          alt=""
          class="size-full object-cover border shadow-sm"
        />
        <div
          v-else
          class="size-full flex items-center justify-center"
        >
          <Icon
            icon="icon-[mdi--note-text-outline]"
            class="size-6 text-muted-foreground/50"
          />
        </div>
      </div>

      <div class="min-w-0">
        <p class="text-sm font-medium truncate">{{ props.note.name }}</p>
        <p class="text-xs text-muted-foreground">{{ formatDate(props.note.updatedAt) }}</p>
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            @click="emit('open')"
          >
            <Icon
              icon="icon-[mdi--open-in-new]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>打开</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="!props.canMoveUp"
            @click="emit('moveUp')"
          >
            <Icon
              icon="icon-[mdi--chevron-up]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>上移</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            :disabled="!props.canMoveDown"
            @click="emit('moveDown')"
          >
            <Icon
              icon="icon-[mdi--chevron-down]"
              class="size-4"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>下移</TooltipContent>
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
