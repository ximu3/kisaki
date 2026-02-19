<!--
  TagDeleteFormDialog
  Delete confirmation dialog for tags.
  Uses DeleteConfirmDialog component.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { db } from '@renderer/core/db'
import { tags } from '@shared/db'
import { notify } from '@renderer/core/notify'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  tagId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const { data, isLoading } = useAsyncData(
  async () => {
    const tag = await db.query.tags.findFirst({ where: eq(tags.id, props.tagId) })
    return { tagName: tag?.name ?? '' }
  },
  {
    watch: [() => props.tagId],
    enabled: () => open.value
  }
)

const tagName = computed(() => data.value?.tagName ?? '')

async function handleConfirm() {
  try {
    await db.delete(tags).where(eq(tags.id, props.tagId))
    notify.success('标签已删除')
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="标签"
    :entity-name="tagName"
    :loading="isLoading"
    @confirm="handleConfirm"
  />
</template>
