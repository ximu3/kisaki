<!--
  CompanyTagsItem
  Display component for a single tag in the list.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { Button } from '@renderer/components/ui/button'
import { getEntityIcon } from '@renderer/utils'

interface TagItem {
  id: string
  tagId: string
  tagName: string
  note: string
  isSpoiler: boolean
  orderInCompany: number
  isNew?: boolean
}

interface Props {
  item: TagItem
  index: number
  isFirst: boolean
  isLast: boolean
  spoilersRevealed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  spoilersRevealed: false
})

const spoilerHidden = computed(() => props.item.isSpoiler && !props.spoilersRevealed)
const displayName = computed(() => (spoilerHidden.value ? '剧透内容' : props.item.tagName))
const displayNote = computed(() =>
  spoilerHidden.value ? '已隐藏，开启「显示剧透」后可查看' : props.item.note
)

const emit = defineEmits<{
  edit: [item: TagItem]
  delete: [index: number]
  moveUp: [index: number]
  moveDown: [index: number]
}>()
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
        @click="emit('delete', props.index)"
      >
        <Icon
          icon="icon-[mdi--delete-outline]"
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
