<!--
  CollectionConvertToStaticDialog

  Confirmation dialog for converting a dynamic collection to static.
  Performs the conversion and materializes current results into link tables.
-->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Icon } from '@renderer/components/ui/icon'
import { useAsyncData } from '@renderer/composables'
import { notify } from '@renderer/core/notify'
import { db } from '@renderer/core/db'
import {
  buildFilterConditions,
  buildOrderBy,
  getFilterQuerySpec
} from '@shared/filter'
import {
  collections,
  collectionGameLinks,
  collectionCharacterLinks,
  collectionPersonLinks,
  collectionCompanyLinks,
  type DynamicCollectionConfig
} from '@shared/db'
import type { SortDirection } from '@shared/common'

interface Props {
  collectionId: string
  /** Optional total count to display in the description */
  totalCount?: number
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  converted: [collectionId: string]
}>()

const isConverting = ref(false)

const { data: collection, isLoading, refetch } = useAsyncData(
  async () => {
    const data = await db.query.collections.findFirst({
      where: eq(collections.id, props.collectionId)
    })
    return data ?? null
  },
  {
    watch: [() => props.collectionId],
    enabled: () => open.value
  }
)

watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) refetch()
  },
  { immediate: true }
)

const dynamicConfig = computed(
  () => (collection.value?.dynamicConfig as DynamicCollectionConfig | null | undefined) ?? null
)

const canConvert = computed(() => {
  if (!collection.value) return false
  if (!collection.value.isDynamic) return false
  return !!dynamicConfig.value
})

async function materializeDynamicCollection(config: DynamicCollectionConfig) {
  const collectionId = props.collectionId

  // Clear existing links to avoid unique constraint issues.
  await db.delete(collectionGameLinks).where(eq(collectionGameLinks.collectionId, collectionId))
  await db
    .delete(collectionCharacterLinks)
    .where(eq(collectionCharacterLinks.collectionId, collectionId))
  await db.delete(collectionPersonLinks).where(eq(collectionPersonLinks.collectionId, collectionId))
  await db.delete(collectionCompanyLinks).where(eq(collectionCompanyLinks.collectionId, collectionId))

  if (config.game?.enabled) {
    const whereCondition = buildFilterConditions(getFilterQuerySpec('game'), config.game.filter)
    const orderBy = buildOrderBy(
      getFilterQuerySpec('game'),
      config.game.sortField,
      config.game.sortDirection as SortDirection
    )
    const gameList = await db.query.games.findMany({
      where: whereCondition,
      orderBy
    } as never)

    if (gameList.length > 0) {
      await db.insert(collectionGameLinks).values(
        gameList.map((g, i) => ({
          id: nanoid(),
          collectionId,
          gameId: g.id,
          orderInCollection: i
        }))
      )
    }
  }

  if (config.character?.enabled) {
    const whereCondition = buildFilterConditions(
      getFilterQuerySpec('character'),
      config.character.filter
    )
    const orderBy = buildOrderBy(
      getFilterQuerySpec('character'),
      config.character.sortField,
      config.character.sortDirection as SortDirection
    )
    const characterList = await db.query.characters.findMany({
      where: whereCondition,
      orderBy
    } as never)

    if (characterList.length > 0) {
      await db.insert(collectionCharacterLinks).values(
        characterList.map((c, i) => ({
          id: nanoid(),
          collectionId,
          characterId: c.id,
          orderInCollection: i
        }))
      )
    }
  }

  if (config.person?.enabled) {
    const whereCondition = buildFilterConditions(getFilterQuerySpec('person'), config.person.filter)
    const orderBy = buildOrderBy(
      getFilterQuerySpec('person'),
      config.person.sortField,
      config.person.sortDirection as SortDirection
    )
    const personList = await db.query.persons.findMany({
      where: whereCondition,
      orderBy
    } as never)

    if (personList.length > 0) {
      await db.insert(collectionPersonLinks).values(
        personList.map((p, i) => ({
          id: nanoid(),
          collectionId,
          personId: p.id,
          orderInCollection: i
        }))
      )
    }
  }

  if (config.company?.enabled) {
    const whereCondition = buildFilterConditions(getFilterQuerySpec('company'), config.company.filter)
    const orderBy = buildOrderBy(
      getFilterQuerySpec('company'),
      config.company.sortField,
      config.company.sortDirection as SortDirection
    )
    const companyList = await db.query.companies.findMany({
      where: whereCondition,
      orderBy
    } as never)

    if (companyList.length > 0) {
      await db.insert(collectionCompanyLinks).values(
        companyList.map((c, i) => ({
          id: nanoid(),
          collectionId,
          companyId: c.id,
          orderInCollection: i
        }))
      )
    }
  }
}

async function handleConfirm() {
  if (isConverting.value) return
  if (!canConvert.value || !dynamicConfig.value) return

  isConverting.value = true
  try {
    await materializeDynamicCollection(dynamicConfig.value)

    await db
      .update(collections)
      .set({ isDynamic: false, dynamicConfig: null })
      .where(eq(collections.id, props.collectionId))

    notify.success('已转换为静态合集')
    emit('converted', props.collectionId)
    open.value = false
  } catch (error) {
    console.error('Failed to convert to static:', error)
    notify.error('转换失败')
  } finally {
    isConverting.value = false
  }
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>转换为静态合集</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>
        <template v-if="props.totalCount !== undefined">
          此操作将把动态合集转换为静态合集，当前筛选结果（共 {{ props.totalCount }}
          项）将被固化为合集内容。转换后，合集内容将不再随数据变化自动更新。
        </template>
        <template v-else>
          此操作将把动态合集转换为静态合集。转换后，合集内容将不再自动更新。
        </template>
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isConverting">取消</AlertDialogCancel>
        <AlertDialogAction
          :disabled="isConverting || isLoading || !canConvert"
          @click="handleConfirm"
        >
          <template v-if="isConverting">
            <Icon
              icon="icon-[mdi--loading]"
              class="size-4 animate-spin mr-1.5"
            />
            转换中...
          </template>
          <template v-else>确认转换</template>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
