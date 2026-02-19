<!--
  CharacterDeleteFormDialog
  Delete confirmation dialog for characters.
  Uses DeleteConfirmDialog component as per conventions.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { characters } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'

interface Props {
  characterId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [characterId: string]
}>()

// Fetch character data when dialog opens
const { data, isLoading } = useAsyncData(
  async () => {
    const character = await db.query.characters.findFirst({
      where: eq(characters.id, props.characterId)
    })
    return { characterName: character?.name ?? '' }
  },
  {
    watch: [() => props.characterId],
    enabled: () => open.value
  }
)

const characterName = computed(() => data.value?.characterName ?? '')

async function handleConfirm() {
  try {
    await db.delete(characters).where(eq(characters.id, props.characterId))
    notify.success('角色已删除')

    emit('deleted', props.characterId)
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="角色"
    :entity-name="characterName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  />
</template>
