<!--
  CollectionDeleteDialog

  Delete confirmation dialog for collections.
  Uses shared DeleteConfirmDialog component.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { collections } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  collectionId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [collectionId: string]
}>()

// Fetch collection data when dialog opens
const { data, isLoading } = useAsyncData<{ collectionName: string }>(
  async () => {
    const collection = await db.query.collections.findFirst({
      where: eq(collections.id, props.collectionId)
    })
    return {
      collectionName: collection?.name ?? ''
    }
  },
  {
    watch: [() => props.collectionId],
    enabled: () => open.value
  }
)

const collectionName = computed(() => data.value?.collectionName ?? '')

async function handleConfirm() {
  try {
    await db.delete(collections).where(eq(collections.id, props.collectionId))
    notify.success('合集已删除')

    emit('deleted', props.collectionId)
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="合集"
    :entity-name="collectionName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  />
</template>
