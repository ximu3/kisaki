<!--
  GameDeleteFormDialog
  Delete confirmation dialog for games with option to add to scanner ignore list.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { games, settings } from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { DeleteConfirmDialog } from '@renderer/components/ui/delete-confirm-dialog'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Label } from '@renderer/components/ui/label'

interface Props {
  gameId: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  deleted: [gameId: string]
}>()

interface InitialData {
  gameName: string
  folderName: string
}

// Form state
const addToIgnored = ref(false)

// Fetch game data when dialog opens
const { data, isLoading } = useAsyncData<InitialData>(
  async () => {
    const game = await db.query.games.findFirst({ where: eq(games.id, props.gameId) })
    let folderName = ''
    if (game?.gameDirPath) {
      const parts = game.gameDirPath.replace(/\\/g, '/').split('/')
      folderName = parts[parts.length - 1] || ''
    }
    return {
      gameName: game?.name ?? '',
      folderName
    }
  },
  {
    watch: [() => props.gameId],
    enabled: () => open.value
  }
)

// Reset form state when data loads
watch(data, () => {
  addToIgnored.value = false
})

const gameName = computed(() => data.value?.gameName ?? '')
const folderName = computed(() => data.value?.folderName ?? '')

async function handleConfirm() {
  try {
    // Add to ignored names if checked
    if (addToIgnored.value && (folderName.value || gameName.value)) {
      const currentSettings = await db.query.settings.findFirst()
      const currentIgnoredNames = currentSettings?.scannerIgnoredNames || []
      const nameToIgnore = folderName.value || gameName.value

      if (!currentIgnoredNames.includes(nameToIgnore)) {
        await db
          .update(settings)
          .set({ scannerIgnoredNames: [...currentIgnoredNames, nameToIgnore] })
          .where(eq(settings.id, 0))
      }
    }

    await db.delete(games).where(eq(games.id, props.gameId))
    notify.success('游戏已删除')

    emit('deleted', props.gameId)
  } catch (error) {
    notify.error(`删除失败: ${(error as Error).message}`)
  }
}
</script>

<template>
  <DeleteConfirmDialog
    v-model:open="open"
    entity-label="游戏"
    :entity-name="gameName"
    :loading="isLoading || !data"
    @confirm="handleConfirm"
  >
    <!-- Additional slot content for ignored checkbox -->
    <div
      v-if="gameName"
      class="flex items-center gap-2 pt-2"
    >
      <Checkbox
        id="add-to-ignored"
        v-model="addToIgnored"
      />
      <Label
        for="add-to-ignored"
        class="text-sm font-normal cursor-pointer"
      >
        将{{ folderName ? `文件夹「${folderName}」` : `「${gameName}」` }}加入扫描器忽略列表
      </Label>
    </div>
  </DeleteConfirmDialog>
</template>
