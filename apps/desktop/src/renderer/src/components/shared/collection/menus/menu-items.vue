<!--
  CollectionMenuItems
  Unified collection menu items that work with both ContextMenu and DropdownMenu.
  Self-contained: fetches its own data and handles mutations internally.
  Pass different menu components via `components` prop for polymorphism.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { eq } from 'drizzle-orm'
import { Icon } from '@renderer/components/ui/icon'
import { useAsyncData, useEvent } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import { uiExtensions } from '@renderer/core/ui-extensions'
import { collections, type Collection } from '@shared/db'
import type { MenuComponents } from '@renderer/types'

interface Props {
  collectionId: string
  /** Whether to fetch data - for lazy loading in context menu */
  enabled?: boolean
  /** Menu component primitives to use */
  components: MenuComponents
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true
})

const emit = defineEmits<{
  openEditMetadataDialog: []
  openEditEntitiesDialog: []
  openEditFilterDialog: []
  openConvertDialog: []
  openDeleteDialog: []
}>()

async function fetchCollection(): Promise<Collection | null> {
  const data = await db.query.collections.findFirst({
    where: eq(collections.id, props.collectionId)
  })
  return data ?? null
}

const { data: collection, refetch } = useAsyncData(fetchCollection, {
  watch: [() => props.collectionId],
  enabled: () => props.enabled
})

useEvent('db:updated', ({ table, id }) => {
  if (table === 'collections' && id === props.collectionId) refetch()
})

const isDynamic = computed(() => collection.value?.isDynamic ?? false)

const pluginActions = computed(() => {
  const ctx = { collectionId: props.collectionId }
  return uiExtensions.menus.collection.single.items.value.filter((action) => {
    if (!action.when) return true
    try {
      return action.when(ctx)
    } catch {
      return false
    }
  })
})

async function handlePluginAction(action: (typeof pluginActions.value)[number]) {
  await action.action({ collectionId: props.collectionId })
}

async function handleToggleNsfw() {
  if (!collection.value) return
  try {
    await db
      .update(collections)
      .set({ isNsfw: !collection.value.isNsfw })
      .where(eq(collections.id, props.collectionId))
    notify.success(collection.value.isNsfw ? '已取消 NSFW 标记' : '已标记为 NSFW')
  } catch {
    notify.error('操作失败')
  }
}
</script>

<template>
  <!-- Only render when data is ready - no loading state to avoid flicker -->
  <template v-if="collection">
    <!-- Edit Collection Metadata -->
    <component
      :is="props.components.Item"
      @select="emit('openEditMetadataDialog')"
    >
      <Icon
        icon="icon-[mdi--pencil-outline]"
        class="size-4"
      />
      编辑信息
    </component>

    <!-- Static: Edit Entities -->
    <component
      :is="props.components.Item"
      v-if="!isDynamic"
      @select="emit('openEditEntitiesDialog')"
    >
      <Icon
        icon="icon-[mdi--format-list-numbered]"
        class="size-4"
      />
      编辑内容
    </component>

    <!-- Dynamic: Edit Filter -->
    <component
      :is="props.components.Item"
      v-if="isDynamic"
      @select="emit('openEditFilterDialog')"
    >
      <Icon
        icon="icon-[mdi--filter-outline]"
        class="size-4"
      />
      编辑筛选
    </component>

    <!-- Dynamic: Convert to Static -->
    <template v-if="isDynamic">
      <component
        :is="props.components.Item"
        @select="emit('openConvertDialog')"
      >
        <Icon
          icon="icon-[mdi--subdirectory-arrow-left]"
          class="size-4"
        />
        转为静态
      </component>
    </template>

    <component :is="props.components.Separator" />

    <!-- NSFW -->
    <component
      :is="props.components.CheckboxItem"
      :model-value="!!collection.isNsfw"
      @select="handleToggleNsfw"
    >
      <Icon
        icon="icon-[mdi--coffee-outline]"
        class="size-4"
      />
      NSFW
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
