<!--
  CharacterBatchMenuItems
  Menu items for batch operations on multiple characters.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { nanoid } from 'nanoid'
import { and, eq, inArray } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { getEntityIcon } from '@renderer/utils'
import {
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent
} from '@renderer/components/ui/context-menu'
import { useAsyncData } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { usePreferencesStore } from '@renderer/stores'
import { characters, collections, collectionCharacterLinks } from '@shared/db'

interface Props {
  characterIds: string[]
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true
})

const preferencesStore = usePreferencesStore()
const { showNsfw } = storeToRefs(preferencesStore)

const emit = defineEmits<{
  openMetadataUpdateDialog: []
  openDeleteDialog: []
}>()

type CollectionRow = { id: string; name: string; order: number }
type LinkRow = { collectionId: string; entityId: string }

async function fetchMenuData(): Promise<{ collections: CollectionRow[]; links: LinkRow[] }> {
  const ids = props.characterIds

  const staticCollections = await db.query.collections.findMany({
    where: and(
      eq(collections.isDynamic, false),
      showNsfw.value ? undefined : eq(collections.isNsfw, false)
    ),
    orderBy: (c, { asc }) => asc(c.order)
  })

  if (ids.length === 0) {
    return {
      collections: staticCollections.map((c) => ({ id: c.id, name: c.name, order: c.order })),
      links: []
    }
  }

  const links = await db
    .select({
      collectionId: collectionCharacterLinks.collectionId,
      entityId: collectionCharacterLinks.characterId
    })
    .from(collectionCharacterLinks)
    .where(inArray(collectionCharacterLinks.characterId, ids))

  return {
    collections: staticCollections.map((c) => ({ id: c.id, name: c.name, order: c.order })),
    links
  }
}

const { data, refetch } = useAsyncData(fetchMenuData, {
  watch: [() => props.characterIds, showNsfw],
  enabled: () => props.enabled
})

const staticCollections = computed(() => data.value?.collections ?? [])
const links = computed(() => data.value?.links ?? [])

const linkMap = computed(() => {
  const map = new Map<string, Set<string>>()
  for (const link of links.value) {
    const set = map.get(link.collectionId) ?? new Set<string>()
    set.add(link.entityId)
    map.set(link.collectionId, set)
  }
  return map
})

const selectedEntityCount = computed(() => props.characterIds.length)

const collectionsAddable = computed(() =>
  staticCollections.value.filter(
    (c) => (linkMap.value.get(c.id)?.size ?? 0) < selectedEntityCount.value
  )
)

const collectionsRemovable = computed(() =>
  staticCollections.value.filter((c) => (linkMap.value.get(c.id)?.size ?? 0) > 0)
)

async function handleAddToCollection(collectionId: string) {
  const ids = props.characterIds
  if (ids.length === 0) return

  const existing = linkMap.value.get(collectionId) ?? new Set<string>()
  const missingIds = ids.filter((id) => !existing.has(id))
  if (missingIds.length === 0) return

  try {
    await db.insert(collectionCharacterLinks).values(
      missingIds.map((characterId) => ({
        id: nanoid(),
        collectionId,
        characterId,
        orderInCollection: 0
      }))
    )
    notify.success('已添加到合集')
    await refetch()
  } catch {
    notify.error('添加失败')
  }
}

async function handleRemoveFromCollection(collectionId: string) {
  const ids = props.characterIds
  if (ids.length === 0) return

  try {
    await db
      .delete(collectionCharacterLinks)
      .where(
        and(
          eq(collectionCharacterLinks.collectionId, collectionId),
          inArray(collectionCharacterLinks.characterId, ids)
        )
      )
    notify.success('已从合集中移除')
    await refetch()
  } catch {
    notify.error('移除失败')
  }
}

async function handleSetFavorite(isFavorite: boolean) {
  const ids = props.characterIds
  if (ids.length === 0) return

  try {
    await db.update(characters).set({ isFavorite }).where(inArray(characters.id, ids))
    notify.success(isFavorite ? '已设为喜欢' : '已取消喜欢')
  } catch {
    notify.error('操作失败')
  }
}
</script>

<template>
  <ContextMenuLabel>已选择 {{ selectedEntityCount }} 项</ContextMenuLabel>
  <ContextMenuSeparator />

  <ContextMenuSub>
    <ContextMenuSubTrigger>
      <Icon
        icon="icon-[mdi--folder-plus-outline]"
        class="size-4"
      />
      加入到合集
    </ContextMenuSubTrigger>
    <ContextMenuSubContent class="min-w-[180px]">
      <template v-if="collectionsAddable.length > 0">
        <div class="max-h-[240px] overflow-auto scrollbar-thin">
          <ContextMenuItem
            v-for="collection in collectionsAddable"
            :key="collection.id"
            @select="handleAddToCollection(collection.id)"
          >
            <Icon
              :icon="getEntityIcon('collection')"
              class="size-4"
            />
            {{ collection.name }}
          </ContextMenuItem>
        </div>
      </template>
      <ContextMenuItem
        v-else
        disabled
      >
        <span class="text-muted-foreground">无可用合集</span>
      </ContextMenuItem>
    </ContextMenuSubContent>
  </ContextMenuSub>

  <ContextMenuSub>
    <ContextMenuSubTrigger>
      <Icon
        icon="icon-[mdi--folder-remove-outline]"
        class="size-4"
      />
      从合集中移除
    </ContextMenuSubTrigger>
    <ContextMenuSubContent class="min-w-[180px]">
      <template v-if="collectionsRemovable.length > 0">
        <div class="max-h-[240px] overflow-auto scrollbar-thin">
          <ContextMenuItem
            v-for="collection in collectionsRemovable"
            :key="collection.id"
            @select="handleRemoveFromCollection(collection.id)"
          >
            <Icon
              :icon="getEntityIcon('collection')"
              class="size-4"
            />
            {{ collection.name }}
          </ContextMenuItem>
        </div>
      </template>
      <ContextMenuItem
        v-else
        disabled
      >
        <span class="text-muted-foreground">无可用合集</span>
      </ContextMenuItem>
    </ContextMenuSubContent>
  </ContextMenuSub>

  <ContextMenuSeparator />

  <ContextMenuItem @select="handleSetFavorite(true)">
    <Icon
      icon="icon-[mdi--heart-outline]"
      class="size-4"
    />
    设为喜欢
  </ContextMenuItem>
  <ContextMenuItem @select="handleSetFavorite(false)">
    <Icon
      icon="icon-[mdi--heart-off-outline]"
      class="size-4"
    />
    取消喜欢
  </ContextMenuItem>

  <ContextMenuSeparator />

  <ContextMenuItem @select="emit('openMetadataUpdateDialog')">
    <Icon
      icon="icon-[mdi--database-sync-outline]"
      class="size-4"
    />
    批量更新元数据
  </ContextMenuItem>

  <ContextMenuItem
    variant="destructive"
    @select="emit('openDeleteDialog')"
  >
    <Icon
      icon="icon-[mdi--delete-outline]"
      class="size-4"
    />
    批量删除
  </ContextMenuItem>
</template>
