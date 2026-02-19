<!--
  CompanyBatchDeleteFormDialog
  Delete confirmation dialog for multiple companies.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { inArray } from 'drizzle-orm'
import { useAsyncData } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { companies } from '@shared/db'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  companyIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [companyIds: string[]]
}>()

const { data, isLoading } = useAsyncData(
  async () => {
    if (props.companyIds.length === 0) return []
    return await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(inArray(companies.id, props.companyIds))
  },
  {
    watch: [() => props.companyIds],
    enabled: () => open.value
  }
)

const count = computed(() => props.companyIds.length)
const names = computed(() => data.value ?? [])
const firstName = computed(() => names.value[0]?.name ?? '')
const entityName = computed(() => {
  if (count.value <= 1) return firstName.value
  return firstName.value ? `${firstName.value} 等 ${count.value} 项` : `${count.value} 项`
})

const previewNames = computed(() => names.value.slice(0, 6).map((n) => n.name).filter(Boolean))

async function handleConfirm() {
  try {
    if (props.companyIds.length === 0) return
    await db.delete(companies).where(inArray(companies.id, props.companyIds))
    notify.success('已删除')
    emit('deleted', props.companyIds)

  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="公司"
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
