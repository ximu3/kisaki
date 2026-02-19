<!--
  CompanyDeleteFormDialog
  Delete confirmation dialog for companies.
  Uses DeleteConfirmDialog component.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { companies } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  companyId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [companyId: string]
}>()

// Fetch company data when dialog opens
const { data, isLoading } = useAsyncData(
  async () => {
    const company = await db.query.companies.findFirst({ where: eq(companies.id, props.companyId) })
    return { companyName: company?.name ?? '' }
  },
  {
    watch: [() => props.companyId],
    enabled: () => open.value
  }
)

const companyName = computed(() => data.value?.companyName ?? '')

async function handleConfirm() {
  try {
    await db.delete(companies).where(eq(companies.id, props.companyId))
    notify.success('公司已删除')

    emit('deleted', props.companyId)
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="公司"
    :entity-name="companyName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  />
</template>
