<!--
  CharacterTagsItem
  Single tag item component showing icon, name, spoiler badge, note, and action buttons.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { getEntityIcon } from '@renderer/utils'

interface Props {
  tagName: string
  note: string
  isSpoiler: boolean
  spoilersRevealed?: boolean
  isFirst: boolean
  isLast: boolean
}

const props = withDefaults(defineProps<Props>(), {
  spoilersRevealed: false
})

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  edit: []
  delete: []
}>()

const spoilerHidden = computed(() => props.isSpoiler && !props.spoilersRevealed)
const displayName = computed(() => (spoilerHidden.value ? '剧透内容' : props.tagName))
const displayNote = computed(() =>
  spoilerHidden.value ? '已隐藏，开启「显示剧透」后可查看' : props.note
)
</script>

<template>
  <div class="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 group">
    <div class="shrink-0">
      <div class="size-10 rounded-md bg-muted flex items-center justify-center">
        <Icon
          :icon="spoilerHidden ? 'icon-[mdi--eye-off-outline]' : getEntityIcon('tag')"
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
        :disabled="props.isFirst"
        class="size-7"
        @click="emit('moveUp')"
      >
        <Icon
          icon="icon-[mdi--chevron-up]"
          class="size-4"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="props.isLast"
        class="size-7"
        @click="emit('moveDown')"
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
        @click="emit('edit')"
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
        @click="emit('delete')"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
