<!--
  CompanyMenuItems
  Unified company menu items that work with both ContextMenu and DropdownMenu.
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
import { uiExtensions } from '@renderer/core/ui-extensions'
import { usePreferencesStore } from '@renderer/stores'
import { companies, collections, collectionCompanyLinks, type Company } from '@shared/db'
import type { MenuComponents } from '@renderer/types'

interface Props {
  companyId: string
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
  openMediaDialog: []
  openMetadataUpdateDialog: []
  openExternalIdsDialog: []
  openDeleteDialog: []
  openNewCollectionDialog: []
}>()

type CollectionData = { id: string; name: string }

interface CompanyMenuData {
  company: Company
  collectionsData: {
    containing: CollectionData[]
    notContaining: CollectionData[]
  }
}

async function fetchCompany(): Promise<CompanyMenuData | null> {
  const companyData = await db.query.companies.findFirst({
    where: eq(companies.id, props.companyId)
  })
  if (!companyData) return null

  // Fetch static collections only (dynamic collections can't be manually modified)
  const staticCollections = await db.query.collections.findMany({
    where: and(
      eq(collections.isDynamic, false),
      showNsfw.value ? undefined : eq(collections.isNsfw, false)
    ),
    orderBy: (c, { asc }) => asc(c.order)
  })
  const links = await db.query.collectionCompanyLinks.findMany({
    where: eq(collectionCompanyLinks.companyId, props.companyId)
  })
  const linkedCollectionIds = new Set(links.map((l) => l.collectionId))

  return {
    company: companyData,
    collectionsData: {
      containing: staticCollections.filter((c) => linkedCollectionIds.has(c.id)),
      notContaining: staticCollections.filter((c) => !linkedCollectionIds.has(c.id))
    }
  }
}

const { data, refetch } = useAsyncData(fetchCompany, {
  watch: [() => props.companyId, showNsfw],
  enabled: () => props.enabled
})

const company = computed(() => data.value?.company ?? null)
const collectionsData = computed(() => data.value?.collectionsData ?? null)

const pluginActions = computed(() => {
  const ctx = { companyId: props.companyId }
  return uiExtensions.menus.company.single.items.value.filter((action) => {
    if (!action.when) return true
    try {
      return action.when(ctx)
    } catch {
      return false
    }
  })
})

async function handlePluginAction(action: (typeof pluginActions.value)[number]) {
  await action.action({ companyId: props.companyId })
}

useEvent('db:updated', ({ table, id }) => {
  if (table === 'companies' && id === props.companyId) refetch()
  if (table === 'collection_company_links') refetch()
  if (table === 'collections') refetch()
})

useEvent('db:inserted', ({ table }) => {
  if (table === 'collection_company_links' || table === 'collections') refetch()
})

useEvent('db:deleted', ({ table }) => {
  if (table === 'collection_company_links' || table === 'collections') refetch()
})

const displayScore = computed(() =>
  company.value?.score !== null && company.value?.score !== undefined
    ? (company.value.score / 10).toFixed(1)
    : null
)

// Action handlers
async function handleAddToCollection(collectionId: string) {
  try {
    await db.insert(collectionCompanyLinks).values({
      id: nanoid(),
      collectionId,
      companyId: props.companyId
    })
    notify.success('已添加至合集')
  } catch {
    notify.error('添加失败')
  }
}

async function handleRemoveFromCollection(collectionId: string) {
  try {
    await db
      .delete(collectionCompanyLinks)
      .where(
        and(
          eq(collectionCompanyLinks.companyId, props.companyId),
          eq(collectionCompanyLinks.collectionId, collectionId)
        )
      )
    notify.success('已从合集中移除')
  } catch {
    notify.error('移除失败')
  }
}

async function handleToggleFavorite() {
  if (!company.value) return
  try {
    await db
      .update(companies)
      .set({ isFavorite: !company.value.isFavorite })
      .where(eq(companies.id, props.companyId))
    notify.success(company.value.isFavorite ? '已取消喜欢' : '已添加至喜欢')
  } catch {
    notify.error('操作失败')
  }
}

async function handleToggleNsfw() {
  if (!company.value) return
  try {
    await db
      .update(companies)
      .set({ isNsfw: !company.value.isNsfw })
      .where(eq(companies.id, props.companyId))
    notify.success(company.value.isNsfw ? '已取消 NSFW 标记' : '已标记为 NSFW')
  } catch {
    notify.error('操作失败')
  }
}
</script>

<template>
  <!-- Only render when data is ready - no loading state to avoid flicker -->
  <template v-if="company && collectionsData">
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

    <!-- Remove from Collection - only show if company is in any collection -->
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
      <span
        v-if="displayScore"
        class="ml-auto text-xs text-muted-foreground"
      >
        {{ displayScore }}
      </span>
    </component>

    <component :is="props.components.Separator" />

    <!-- Favorite & NSFW -->
    <component
      :is="props.components.CheckboxItem"
      :model-value="!!company.isFavorite"
      @select="handleToggleFavorite"
    >
      <Icon
        icon="icon-[mdi--heart-outline]"
        class="size-4"
      />
      喜欢
    </component>

    <component
      :is="props.components.CheckboxItem"
      :model-value="!!company.isNsfw"
      @select="handleToggleNsfw"
    >
      <Icon
        icon="icon-[mdi--coffee-outline]"
        class="size-4"
      />
      NSFW
    </component>

    <component :is="props.components.Separator" />

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
