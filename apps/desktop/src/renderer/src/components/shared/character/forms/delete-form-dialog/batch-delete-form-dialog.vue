<!--
  CharacterBatchDeleteFormDialog
  Delete confirmation dialog for multiple characters.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { inArray } from 'drizzle-orm'
import { useAsyncData } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { characters } from '@shared/db'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  characterIds: string[]
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [characterIds: string[]]
}>()

const { data, isLoading } = useAsyncData(
  async () => {
    if (props.characterIds.length === 0) return []
    return await db
      .select({ id: characters.id, name: characters.name })
      .from(characters)
      .where(inArray(characters.id, props.characterIds))
  },
  {
    watch: [() => props.characterIds],
    enabled: () => open.value
  }
)

const count = computed(() => props.characterIds.length)
const names = computed(() => data.value ?? [])
const firstName = computed(() => names.value[0]?.name ?? '')
const entityName = computed(() => {
  if (count.value <= 1) return firstName.value
  return firstName.value ? `${firstName.value} 等 ${count.value} 项` : `${count.value} 项`
})

const previewNames = computed(() => names.value.slice(0, 6).map((n) => n.name).filter(Boolean))

async function handleConfirm() {
  try {
    if (props.characterIds.length === 0) return
    await db.delete(characters).where(inArray(characters.id, props.characterIds))
    notify.success('已删除')
    emit('deleted', props.characterIds)

  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="角色"
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
