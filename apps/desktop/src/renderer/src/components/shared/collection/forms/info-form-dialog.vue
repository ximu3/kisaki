<!--
  CollectionInfoFormDialog

  Dialog for creating or editing a collection's basic metadata.
  Only handles: name, description, NSFW, type (static/dynamic).
  Filter configuration and content editing are handled from detail page.
-->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { notify } from '@renderer/core/notify'
import { db, attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import {
  collections,
  collectionGameLinks,
  collectionCharacterLinks,
  collectionPersonLinks,
  collectionCompanyLinks
} from '@shared/db'
import { useAsyncData } from '@renderer/composables'
import { getOpenImageDialogOptions } from '@renderer/utils/dialog'
import { getAttachmentUrl } from '@renderer/utils'
import type { ContentEntityType } from '@shared/common'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { MarkdownEditor } from '@renderer/components/ui/markdown'
import { Switch } from '@renderer/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@renderer/components/ui/radio-group'
import { Label } from '@renderer/components/ui/label'
import { ImagePicker } from '@renderer/components/ui/image-picker'
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldGroup
} from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { Spinner } from '@renderer/components/ui/spinner'

export interface Props {
  /** Collection ID for edit mode */
  collectionId?: string
  /**
   * Entity to add to collection after creation (static mode only).
   * Used by entity context/dropdown menus for quick "新建合集..." flows.
   */
  entityToAdd?: { type: ContentEntityType; id: string }
}

const props = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

const isEditMode = !!props.collectionId

// Form state
interface FormData {
  name: string
  description: string
  isNsfw: boolean
  isDynamic: boolean
}

const formData = ref<FormData>({
  name: '',
  description: '',
  isNsfw: false,
  isDynamic: false
})
const isSubmitting = ref(false)

type CoverMode = 'keep' | 'set' | 'clear'
const coverMode = ref<CoverMode>('keep')
const coverPath = ref<string | null>(null)

// For edit mode, fetch collection data
const {
  data: existingCollection,
  isLoading,
  refetch
} = useAsyncData(
  () => db.query.collections.findFirst({ where: eq(collections.id, props.collectionId!) }),
  {
    watch: [() => props.collectionId],
    enabled: () => open.value && isEditMode
  }
)

// Initialize form state when data loads
watch(existingCollection, (data) => {
  if (data) {
    formData.value = {
      name: data.name,
      description: data.description ?? '',
      isNsfw: data.isNsfw,
      isDynamic: data.isDynamic
    }
  }
})

const currentCoverUrl = computed(() => {
  if (!isEditMode) return null
  if (coverMode.value === 'clear') return null
  if (coverMode.value === 'set') return null
  if (!existingCollection.value?.coverFile) return null
  return getAttachmentUrl(
    'collections',
    existingCollection.value.id,
    existingCollection.value.coverFile
  )
})

// Reset form when dialog opens
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      coverMode.value = 'keep'
      coverPath.value = null
      if (isEditMode) {
        refetch()
      } else {
        // Create mode - reset to defaults
        formData.value = {
          name: '',
          description: '',
          isNsfw: false,
          isDynamic: false
        }
      }
    }
  },
  { immediate: true }
)

async function pickCoverPath(): Promise<string | null> {
  const dialogOptions = getOpenImageDialogOptions({ title: '选择封面' })
  const res = await ipcManager.invoke('native:open-dialog', dialogOptions)
  if (!res.success) {
    throw new Error(res.error || 'Failed to open file dialog')
  }
  if (!res.data || res.data.canceled || !res.data.filePaths || res.data.filePaths.length === 0) {
    return null
  }
  return res.data.filePaths[0]
}

async function handlePickCover() {
  try {
    const path = await pickCoverPath()
    if (!path) return
    coverMode.value = 'set'
    coverPath.value = path
  } catch (error) {
    console.error('Pick cover failed:', error)
    notify.error('选择封面失败')
  }
}

function handleClearCover() {
  coverMode.value = 'clear'
  coverPath.value = null
}

async function handleSubmit() {
  if (!formData.value.name.trim()) return

  isSubmitting.value = true
  try {
    if (isEditMode && existingCollection.value) {
      // Only update name, description, isNsfw - type cannot be changed
      await db
        .update(collections)
        .set({
          name: formData.value.name,
          description: formData.value.description.trim() || null,
          isNsfw: formData.value.isNsfw
        })
        .where(eq(collections.id, existingCollection.value.id))

      if (coverMode.value === 'clear') {
        await attachment.clearFile(collections, existingCollection.value.id, 'coverFile')
      }
      if (coverMode.value === 'set' && coverPath.value) {
        await attachment.setFile(collections, existingCollection.value.id, 'coverFile', {
          kind: 'path',
          path: coverPath.value
        })
      }
      notify.success('合集已更新')
    } else {
      const newCollectionId = nanoid()
      await db.insert(collections).values({
        id: newCollectionId,
        name: formData.value.name,
        description: formData.value.description.trim() || null,
        isNsfw: formData.value.isNsfw,
        isDynamic: formData.value.isDynamic,
        dynamicConfig: null
      })

      if (coverMode.value === 'set' && coverPath.value) {
        await attachment.setFile(collections, newCollectionId, 'coverFile', {
          kind: 'path',
          path: coverPath.value
        })
      }

      // Add entity to collection if provided (static mode only)
      if (props.entityToAdd && !formData.value.isDynamic) {
        const entityType = props.entityToAdd.type
        const entityId = props.entityToAdd.id

        switch (entityType) {
          case 'game': {
            const existing = await db.query.collectionGameLinks.findFirst({
              where: and(
                eq(collectionGameLinks.collectionId, newCollectionId),
                eq(collectionGameLinks.gameId, entityId)
              )
            })
            if (!existing?.id) {
              await db.insert(collectionGameLinks).values({
                id: nanoid(),
                collectionId: newCollectionId,
                gameId: entityId
              })
            }
            notify.success('已创建合集并添加游戏')
            break
          }
          case 'character': {
            const existing = await db.query.collectionCharacterLinks.findFirst({
              where: and(
                eq(collectionCharacterLinks.collectionId, newCollectionId),
                eq(collectionCharacterLinks.characterId, entityId)
              )
            })
            if (!existing?.id) {
              await db.insert(collectionCharacterLinks).values({
                id: nanoid(),
                collectionId: newCollectionId,
                characterId: entityId
              })
            }
            notify.success('已创建合集并添加角色')
            break
          }
          case 'person': {
            const existing = await db.query.collectionPersonLinks.findFirst({
              where: and(
                eq(collectionPersonLinks.collectionId, newCollectionId),
                eq(collectionPersonLinks.personId, entityId)
              )
            })
            if (!existing?.id) {
              await db.insert(collectionPersonLinks).values({
                id: nanoid(),
                collectionId: newCollectionId,
                personId: entityId
              })
            }
            notify.success('已创建合集并添加人物')
            break
          }
          case 'company': {
            const existing = await db.query.collectionCompanyLinks.findFirst({
              where: and(
                eq(collectionCompanyLinks.collectionId, newCollectionId),
                eq(collectionCompanyLinks.companyId, entityId)
              )
            })
            if (!existing?.id) {
              await db.insert(collectionCompanyLinks).values({
                id: nanoid(),
                collectionId: newCollectionId,
                companyId: entityId
              })
            }
            notify.success('已创建合集并添加公司')
            break
          }
        }
      } else {
        notify.success('合集已创建')
      }
    }
    open.value = false
  } catch (_error) {
    notify.error(isEditMode ? '更新失败' : '创建失败')
  } finally {
    isSubmitting.value = false
  }
}

// Computed model for isDynamic to use with RadioGroup
const modeModel = computed({
  get: () => (formData.value.isDynamic ? 'dynamic' : 'static'),
  set: (value: string) => {
    formData.value.isDynamic = value === 'dynamic'
  }
})

const canSubmit = computed(() => formData.value.name.trim())
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="w-[50vw] max-w-none">
      <!-- Loading state for edit mode -->
      <template v-if="isEditMode && isLoading">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else>
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? '编辑合集' : '新建合集' }}</DialogTitle>
        </DialogHeader>
        <Form @submit="handleSubmit">
          <DialogBody>
              <FieldGroup>
              <Field>
                <FieldLabel>名称</FieldLabel>
                <FieldContent>
                  <Input
                    v-model="formData.name"
                    placeholder="输入合集名称"
                    autofocus
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>封面</FieldLabel>
                <FieldContent>
                  <ImagePicker
                    :image-url="currentCoverUrl"
                    :picked-path="coverMode === 'set' ? coverPath : null"
                    pick-label="选择封面"
                    :clear-disabled="
                      (!isEditMode && coverMode !== 'set') ||
                      (isEditMode && !existingCollection?.coverFile && coverMode !== 'set')
                    "
                    @pick="handlePickCover"
                    @clear="handleClearCover"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>描述</FieldLabel>
                <FieldContent>
                  <MarkdownEditor
                    v-model="formData.description"
                    placeholder="添加描述（可选，支持 Markdown）"
                    min-height="140px"
                    max-height="200px"
                  />
                </FieldContent>
              </Field>

              <!-- Type selection - only shown when creating new collection -->
              <Field v-if="!isEditMode">
                <FieldLabel>类型</FieldLabel>
                <FieldDescription>
                  静态合集手动添加内容，动态合集根据筛选条件自动更新
                </FieldDescription>
                <FieldContent>
                  <RadioGroup
                    v-model="modeModel"
                    class="flex gap-4"
                  >
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem
                        id="static"
                        value="static"
                      />
                      <Label
                        for="static"
                        class="cursor-pointer"
                      >
                        静态合集
                      </Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem
                        id="dynamic"
                        value="dynamic"
                      />
                      <Label
                        for="dynamic"
                        class="cursor-pointer"
                      >
                        动态合集
                      </Label>
                    </div>
                  </RadioGroup>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>成人内容</FieldLabel>
                <FieldDescription>标记此合集包含成人内容</FieldDescription>
                <FieldContent>
                  <Switch
                    v-model="formData.isNsfw"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              :disabled="isSubmitting"
              @click="open = false"
            >
              取消
            </Button>
            <Button
              type="submit"
              :disabled="isSubmitting || !canSubmit"
            >
              {{ isEditMode ? '保存' : '创建' }}
            </Button>
          </DialogFooter>
        </Form>
      </template>
    </DialogContent>
  </Dialog>
</template>
