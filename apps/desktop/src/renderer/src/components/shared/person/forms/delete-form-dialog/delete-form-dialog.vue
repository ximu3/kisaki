<!--
  PersonDeleteFormDialog
  Delete confirmation dialog for persons.
  Uses shared DeleteConfirmDialog component.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { persons } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  personId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [personId: string]
}>()

// Fetch person data when dialog opens
const { data, isLoading } = useAsyncData<{ personName: string }>(
  async () => {
    const person = await db.query.persons.findFirst({ where: eq(persons.id, props.personId) })
    return {
      personName: person?.name ?? ''
    }
  },
  {
    watch: [() => props.personId],
    enabled: () => open.value
  }
)

const personName = computed(() => data.value?.personName ?? '')

async function handleConfirm() {
  try {
    await db.delete(persons).where(eq(persons.id, props.personId))
    notify.success('人物已删除')

    emit('deleted', props.personId)
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="人物"
    :entity-name="personName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  />
</template>
