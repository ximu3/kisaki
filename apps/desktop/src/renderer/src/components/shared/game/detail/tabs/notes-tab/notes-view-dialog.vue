<!--
  GameDetailNotesViewDialog
  Readonly dialog for viewing a single game note.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { useAsyncData, useEvent } from '@renderer/composables'
import { db } from '@renderer/core/db'
import { gameNotes } from '@shared/db'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Icon } from '@renderer/components/ui/icon'
import { Spinner } from '@renderer/components/ui/spinner'
import { MarkdownContent } from '@renderer/components/ui/markdown'
import { getAttachmentUrl } from '@renderer/utils'

interface Props {
  noteId: string
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  edit: []
}>()

const { data: note, isLoading } = useAsyncData(
  () => db.query.gameNotes.findFirst({ where: eq(gameNotes.id, props.noteId) }),
  { watch: [() => props.noteId], enabled: () => open.value }
)

const coverUrl = computed(() => {
  if (!note.value?.coverFile) return null
  return getAttachmentUrl('game_notes', note.value.id, note.value.coverFile)
})

useEvent('db:deleted', ({ table, id }) => {
  if (table === 'game_notes' && id === props.noteId) {
    open.value = false
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-4xl">
      <template v-if="isLoading">
        <DialogBody class="flex items-center justify-center py-10">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else-if="!note">
        <DialogHeader>
          <DialogTitle>笔记</DialogTitle>
        </DialogHeader>
        <DialogBody class="text-sm text-muted-foreground py-10 text-center">未找到笔记</DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            @click="open = false"
          >
            关闭
          </Button>
        </DialogFooter>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Icon
              icon="icon-[mdi--note-text-outline]"
              class="size-4 text-muted-foreground"
            />
            {{ note.name }}
          </DialogTitle>
        </DialogHeader>
        <DialogBody class="max-h-[70vh] overflow-auto scrollbar-thin space-y-4">
          <div
            v-if="coverUrl"
            class="rounded-lg overflow-hidden border bg-muted"
          >
            <img
              :src="coverUrl"
              alt=""
              class="w-full max-h-[360px] object-contain"
            />
          </div>
          <MarkdownContent
            :content="note.content || ''"
            class="prose-headings:scroll-mt-4"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            @click="open = false"
          >
            关闭
          </Button>
          <Button @click="emit('edit')">编辑</Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>
