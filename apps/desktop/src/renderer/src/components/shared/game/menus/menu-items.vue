<!--
  GameMenuItems
  Unified game menu items that work with both ContextMenu and DropdownMenu.
  Self-contained: fetches its own data and handles mutations internally.
  Pass different menu components via `components` prop for polymorphism.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { eq, and } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { getEntityIcon } from '@renderer/utils'
import { useAsyncData, useEvent } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { usePreferencesStore } from '@renderer/stores'
import { games, collections, collectionGameLinks, type Game } from '@shared/db'
import { Status } from '@shared/db'
import type { MenuComponents } from '@renderer/types'

// Status options for selection
const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'notStarted', label: '未开始' },
  { value: 'inProgress', label: '进行中' },
  { value: 'partial', label: '部分完成' },
  { value: 'completed', label: '已完成' },
  { value: 'multiple', label: '多周目' },
  { value: 'shelved', label: '已搁置' }
]

interface Props {
  gameId: string
  /** Whether to fetch data - for lazy loading in context menu */
  enabled?: boolean
  /** Menu component primitives to use */
  components: MenuComponents
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true
})

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const emit = defineEmits<{
  openScoreDialog: []
  openLaunchConfigDialog: []
  openMediaDialog: []
  openMetadataUpdateDialog: []
  openExternalIdsDialog: []
  openDeleteDialog: []
  openNewCollectionDialog: []
}>()

type CollectionData = { id: string; name: string }

interface GameMenuData {
  game: Game
  collectionsData: {
    containing: CollectionData[]
    notContaining: CollectionData[]
  }
}

async function fetchGameData(): Promise<GameMenuData | null> {
  // Fetch game
  const gameData = await db.query.games.findFirst({ where: eq(games.id, props.gameId) })
  if (!gameData) return null

  // Fetch static collections only (dynamic collections can't be manually modified)
  const staticCollections = await db.query.collections.findMany({
    where: and(
      eq(collections.isDynamic, false),
      showNsfw.value ? undefined : eq(collections.isNsfw, false)
    )
  })
  const links = await db.query.collectionGameLinks.findMany({
    where: eq(collectionGameLinks.gameId, props.gameId)
  })
  const linkedCollectionIds = new Set(links.map((l) => l.collectionId))

  return {
    game: gameData,
    collectionsData: {
      containing: staticCollections.filter((c) => linkedCollectionIds.has(c.id)),
      notContaining: staticCollections.filter((c) => !linkedCollectionIds.has(c.id))
    }
  }
}

const { data, refetch } = useAsyncData(fetchGameData, {
  watch: [() => props.gameId, showNsfw],
  enabled: () => props.enabled
})

const game = computed(() => data.value?.game ?? null)
const collectionsData = computed(() => data.value?.collectionsData ?? null)
const canOpenGameDir = computed(() => {
  const current = game.value
  if (!current) return false
  return !!(current.gameDirPath || (current.launcherMode === 'file' && current.launcherPath))
})

const pluginActions = computed(() => {
  const ctx = { gameId: props.gameId }
  return uiExtensions.menus.game.single.items.value.filter((action) => {
    if (!action.when) return true
    try {
      return action.when(ctx)
    } catch {
      return false
    }
  })
})

async function handlePluginAction(action: (typeof pluginActions.value)[number]) {
  await action.action({ gameId: props.gameId })
}

useEvent('db:updated', ({ table, id }) => {
  if (table === 'games' && id === props.gameId) refetch()
  if (table === 'collection_game_links') refetch()
  if (table === 'collections') refetch()
})

useEvent('db:inserted', ({ table }) => {
  if (table === 'collection_game_links' || table === 'collections') refetch()
})

useEvent('db:deleted', ({ table }) => {
  if (table === 'collection_game_links' || table === 'collections') refetch()
})

// Action handlers
async function handleAddToCollection(collectionId: string) {
  try {
    await db.insert(collectionGameLinks).values({
      id: nanoid(),
      collectionId,
      gameId: props.gameId
    })
    notify.success('已添加至合集')
  } catch {
    notify.error('添加失败')
  }
}

async function handleRemoveFromCollection(collectionId: string) {
  try {
    await db
      .delete(collectionGameLinks)
      .where(
        and(
          eq(collectionGameLinks.gameId, props.gameId),
          eq(collectionGameLinks.collectionId, collectionId)
        )
      )
    notify.success('已从合集中移除')
  } catch {
    notify.error('移除失败')
  }
}

// Computed model for status dropdown
const statusModel = computed({
  get: () => game.value?.status,
  set: async (status: Status | undefined) => {
    if (!status) return
    try {
      await db.update(games).set({ status }).where(eq(games.id, props.gameId))
      notify.success('状态已更新')
    } catch {
      notify.error('更新失败')
    }
  }
})

async function handleToggleNsfw() {
  if (!game.value) return
  try {
    await db.update(games).set({ isNsfw: !game.value.isNsfw }).where(eq(games.id, props.gameId))
    notify.success(game.value.isNsfw ? '已取消 NSFW 标记' : '已标记为 NSFW')
  } catch {
    notify.error('操作失败')
  }
}

async function handleToggleFavorite() {
  if (!game.value) return
  try {
    await db
      .update(games)
      .set({ isFavorite: !game.value.isFavorite })
      .where(eq(games.id, props.gameId))
    notify.success(game.value.isFavorite ? '已取消喜欢' : '已添加至我喜欢')
  } catch {
    notify.error('操作失败')
  }
}

async function handleOpenGameDir() {
  const current = game.value
  const pathToOpen =
    current?.gameDirPath || (current?.launcherMode === 'file' ? current?.launcherPath : null)
  if (!pathToOpen) {
    notify.error('游戏目录未设置')
    return
  }
  const result = await ipcManager.invoke('native:open-path', { path: pathToOpen, ensure: 'folder' })
  if (!result.success) {
    notify.error('无法打开游戏目录')
  }
}
</script>

<template>
  <!-- Only render when data is ready - no loading state to avoid flicker -->
  <template v-if="game && collectionsData">
    <!-- Add to Collection -->
    <component :is="props.components.Sub">
      <component :is="props.components.SubTrigger">
        <Icon
          icon="icon-[mdi--folder-plus-outline]"
          class="size-4"
        />
        添加至合集
      </component>
      <component
        :is="props.components.SubContent"
        class="min-w-[180px]"
      >
        <template v-if="collectionsData.notContaining.length > 0">
          <div class="max-h-[200px] overflow-auto scrollbar-thin">
            <component
              :is="props.components.Item"
              v-for="collection in collectionsData.notContaining"
              :key="collection.id"
              @select="handleAddToCollection(collection.id)"
            >
              <Icon
                :icon="getEntityIcon('collection')"
                class="size-4"
              />
              {{ collection.name }}
            </component>
          </div>
        </template>
        <component
          :is="props.components.Item"
          v-else
          disabled
        >
          <span class="text-muted-foreground">无可用合集</span>
        </component>
        <component :is="props.components.Separator" />
        <component
          :is="props.components.Item"
          @select="emit('openNewCollectionDialog')"
        >
          <Icon
            icon="icon-[mdi--plus]"
            class="size-4"
          />
          新建合集...
        </component>
      </component>
    </component>

    <!-- Remove from Collection - only show if game is in any collection -->
    <component
      :is="props.components.Sub"
      v-if="collectionsData.containing.length > 0"
    >
      <component :is="props.components.SubTrigger">
        <Icon
          icon="icon-[mdi--folder-remove-outline]"
          class="size-4"
        />
        从合集中移除
      </component>
      <component
        :is="props.components.SubContent"
        class="min-w-[180px]"
      >
        <div class="max-h-[200px] overflow-auto scrollbar-thin">
          <component
            :is="props.components.Item"
            v-for="collection in collectionsData.containing"
            :key="collection.id"
            @select="handleRemoveFromCollection(collection.id)"
          >
            <Icon
              :icon="getEntityIcon('collection')"
              class="size-4"
            />
            {{ collection.name }}
          </component>
        </div>
      </component>
    </component>

    <component :is="props.components.Separator" />

    <!-- Play Status -->
    <component :is="props.components.Sub">
      <component :is="props.components.SubTrigger">
        <Icon
          icon="icon-[mdi--bookmark-outline]"
          class="size-4"
        />
        游玩状态
      </component>
      <component
        :is="props.components.SubContent"
        class="min-w-[140px]"
      >
        <component
          :is="props.components.RadioGroup"
          v-model="statusModel"
        >
          <component
            :is="props.components.RadioItem"
            v-for="option in STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </component>
        </component>
      </component>
    </component>

    <!-- Edit Score -->
    <component
      :is="props.components.Item"
      @select="emit('openScoreDialog')"
    >
      <Icon
        icon="icon-[mdi--starburst-outline]"
        class="size-4"
      />
      修改评分
    </component>

    <component :is="props.components.Separator" />

    <!-- Toggle Favorite -->
    <component
      :is="props.components.CheckboxItem"
      :model-value="!!game.isFavorite"
      @select="handleToggleFavorite"
    >
      <Icon
        icon="icon-[mdi--heart-outline]"
        class="size-4"
      />
      喜欢
    </component>

    <!-- Toggle NSFW -->
    <component
      :is="props.components.CheckboxItem"
      :model-value="!!game.isNsfw"
      @select="handleToggleNsfw"
    >
      <Icon
        icon="icon-[mdi--coffee-outline]"
        class="size-4"
      />
      NSFW
    </component>

    <component :is="props.components.Separator" />

    <!-- Open Game Directory -->
    <component
      :is="props.components.Item"
      :disabled="!canOpenGameDir"
      @select="handleOpenGameDir"
    >
      <Icon
        icon="icon-[mdi--folder-open-outline]"
        class="size-4"
      />
      打开游戏目录
    </component>

    <!-- Launch Config -->
    <component
      :is="props.components.Item"
      @select="emit('openLaunchConfigDialog')"
    >
      <Icon
        icon="icon-[mdi--power-settings-new]"
        class="size-4"
      />
      启动配置
    </component>

    <!-- Media Management -->
    <component
      :is="props.components.Item"
      @select="emit('openMediaDialog')"
    >
      <Icon
        icon="icon-[mdi--image-multiple-outline]"
        class="size-4"
      />
      媒体管理
    </component>

    <!-- Metadata Update -->
    <component
      :is="props.components.Item"
      @select="emit('openMetadataUpdateDialog')"
    >
      <Icon
        icon="icon-[mdi--database-sync-outline]"
        class="size-4"
      />
      更新元数据
    </component>

    <component
      :is="props.components.Item"
      @select="emit('openExternalIdsDialog')"
    >
      <Icon
        icon="icon-[mdi--card-text-outline]"
        class="size-4"
      />
      管理外部ID
    </component>

    <component
      :is="props.components.Separator"
      v-if="pluginActions.length > 0"
    />

    <component
      :is="props.components.Item"
      v-for="action in pluginActions"
      :key="action.id"
      @select="handlePluginAction(action)"
    >
      <Icon
        v-if="action.icon"
        :icon="action.icon"
        class="size-4"
      />
      {{ action.label }}
    </component>

    <component :is="props.components.Separator" />

    <!-- Delete -->
    <component
      :is="props.components.Item"
      variant="destructive"
      @select="emit('openDeleteDialog')"
    >
      <Icon
        icon="icon-[mdi--delete-outline]"
        class="size-4"
      />
      删除
    </component>
  </template>
</template>
