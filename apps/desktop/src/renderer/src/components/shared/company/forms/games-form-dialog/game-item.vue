<!--
  CompanyGamesItem
  Display component for a single game in the list.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { getAttachmentUrl, getEntityIcon } from '@renderer/utils'
import type { GameCompanyType } from '@shared/db'

interface GameLinkItem {
  id: string
  gameId: string
  gameName: string
  gameCover: string | null
  type: GameCompanyType
  note: string
  isSpoiler: boolean
  orderInCompany: number
  isNew?: boolean
}

interface Props {
  item: GameLinkItem
  index: number
  isFirst: boolean
  isLast: boolean
  spoilersRevealed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  spoilersRevealed: false
})

const emit = defineEmits<{
  edit: [item: GameLinkItem]
  delete: [id: string]
  moveUp: [index: number]
  moveDown: [index: number]
}>()

const spoilerHidden = computed(() => props.item.isSpoiler && !props.spoilersRevealed)

const coverUrl = computed(() =>
  props.item.gameCover
    ? getAttachmentUrl('games', props.item.gameId, props.item.gameCover, {
        width: 100,
        height: 100
      })
    : null
)

const displayName = computed(() => (spoilerHidden.value ? '剧透内容' : props.item.gameName))
const displayNote = computed(() =>
  spoilerHidden.value ? '已隐藏，开启「显示剧透」后可查看' : props.item.note
)
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div
      v-if="coverUrl && !spoilerHidden"
      class="shrink-0 border shadow-sm rounded-md size-10"
    >
      <img
        :src="coverUrl"
        :alt="displayName"
        class="rounded-md object-cover size-full"
      />
    </div>
    <div
      v-else
      class="shrink-0"
    >
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          :icon="spoilerHidden ? 'icon-[mdi--eye-off-outline]' : getEntityIcon('game')"
          class="size-5 text-muted-foreground"
        />
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate flex items-center gap-2">
        {{ displayName }}
      </div>
      <div
        v-if="displayNote"
        class="text-xs text-muted-foreground truncate"
      >
        {{ displayNote }}
      </div>
    </div>
    <div
      v-if="!spoilerHidden"
      class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.isFirst"
        @click="emit('moveUp', props.index)"
      >
        <Icon
          icon="icon-[mdi--chevron-up]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        :disabled="props.isLast"
        @click="emit('moveDown', props.index)"
      >
        <Icon
          icon="icon-[mdi--chevron-down]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7"
        @click="emit('edit', props.item)"
      >
        <Icon
          icon="icon-[mdi--pencil-outline]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="size-7 text-destructive hover:text-destructive"
        @click="emit('delete', props.item.id)"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
