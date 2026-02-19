<!--
  PersonBatchDeleteFormDialog
  Delete confirmation dialog for multiple persons.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { inArray } from 'drizzle-orm'
import { useAsyncData } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { persons } from '@shared/db'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  personIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [personIds: string[]]
}>()

const { data, isLoading } = useAsyncData(
  async () => {
    if (props.personIds.length === 0) return []
    return await db
      .select({ id: persons.id, name: persons.name })
      .from(persons)
      .where(inArray(persons.id, props.personIds))
  },
  {
    watch: [() => props.personIds],
    enabled: () => open.value
  }
)

const count = computed(() => props.personIds.length)
const names = computed(() => data.value ?? [])
const firstName = computed(() => names.value[0]?.name ?? '')
const entityName = computed(() => {
  if (count.value <= 1) return firstName.value
  return firstName.value ? `${firstName.value} 等 ${count.value} 项` : `${count.value} 项`
})

const previewNames = computed(() => names.value.slice(0, 6).map((n) => n.name).filter(Boolean))

async function handleConfirm() {
  try {
    if (props.personIds.length === 0) return
    await db.delete(persons).where(inArray(persons.id, props.personIds))
    notify.success('已删除')
    emit('deleted', props.personIds)

  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="人物"
    :entity-name="entityName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  >
    <div
      v-if="previewNames.length > 0"
      class="text-xs text-muted-foreground space-y-1"
    >
      <div
        v-for="(name, index) in previewNames"
        :key="index"
        class="truncate"
      >
        {{ name }}
      </div>
      <div
        v-if="count > previewNames.length"
        class="opacity-70"
      >
        …等 {{ count }} 项
      </div>
    </div>
  </DeleteConfirmDialog>
</template>
