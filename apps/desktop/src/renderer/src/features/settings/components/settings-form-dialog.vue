<!--
  SettingsDialog
  Application settings dialog.
-->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { eq } from 'drizzle-orm'
import { ipcManager } from '@renderer/core/ipc'
import { db } from '@renderer/core/db'
import { notify } from '@renderer/core/notify'
import { useAsyncData, useRenderState } from '@renderer/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@renderer/components/ui/field'
import { Form } from '@renderer/components/ui/form'
import { Spinner } from '@renderer/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@renderer/components/ui/select'
import { useThemeStore } from '@renderer/stores'
import { settings, type MainWindowCloseAction } from '@shared/db'

const open = defineModel<boolean>('open', { required: true })

const themeStore = useThemeStore()
const { themes, activeThemeId } = storeToRefs(themeStore)

const isSaving = ref(false)
type SettingsFormData = {
  autoLaunch: boolean
  activeThemeId: string
  mainWindowCloseAction: MainWindowCloseAction
}

const formData = ref<SettingsFormData>({
  autoLaunch: false,
  activeThemeId: activeThemeId.value,
  mainWindowCloseAction: 'exit'
})

const openModel = computed({
  get: () => open.value,
  set: (v) => {
    if (!isSaving.value) open.value = v
  }
})

const { data, isLoading, error, refetch } = useAsyncData(
  async () => {
    const [autoLaunchResult, currentSettings] = await Promise.all([
      ipcManager.invoke('native:get-auto-launch'),
      db.query.settings.findFirst()
    ])

    if (!autoLaunchResult.success) {
      throw new Error(autoLaunchResult.error)
    }

    if (!currentSettings) {
      throw new Error('Settings not found')
    }

    return {
      autoLaunch: autoLaunchResult.data,
      mainWindowCloseAction: currentSettings.mainWindowCloseAction
    }
  },
  { enabled: open }
)
const state = useRenderState(isLoading, error, data)

watch(open, (isOpen) => {
  if (!isOpen) return
  formData.value.activeThemeId = activeThemeId.value
})

watch(data, (d) => {
  if (!d) return
  formData.value.autoLaunch = d.autoLaunch
  formData.value.mainWindowCloseAction = d.mainWindowCloseAction
})

watch(
  () => formData.value.activeThemeId,
  (themeId) => {
    if (themeId === activeThemeId.value) return
    themeStore.setActiveTheme(themeId)
  }
)

async function handleSubmit() {
  isSaving.value = true
  try {
    const result = await ipcManager.invoke('native:set-auto-launch', formData.value.autoLaunch)
    if (!result.success) {
      throw new Error(result.error)
    }

    await db
      .update(settings)
      .set({ mainWindowCloseAction: formData.value.mainWindowCloseAction })
      .where(eq(settings.id, 0))
      .run()

    ipcManager.send('window:set-main-window-close-action', formData.value.mainWindowCloseAction)

    notify.success('设置已保存')
    open.value = false
  } catch (e) {
    notify.error('保存失败', e instanceof Error ? e.message : String(e))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>设置</DialogTitle>
      </DialogHeader>

      <template v-if="state === 'loading'">
        <DialogBody class="flex items-center justify-center py-8">
          <Spinner class="size-8" />
        </DialogBody>
      </template>

      <template v-else-if="state === 'error'">
        <DialogBody class="space-y-3">
          <p class="text-sm text-destructive">
            {{ error }}
          </p>
          <div class="flex justify-end">
            <Button
              type="button"
              variant="outline"
              @click="refetch"
            >
              重试
            </Button>
          </div>
        </DialogBody>
      </template>

      <template v-else>
        <Form @submit="handleSubmit">
          <DialogBody>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel>主题</FieldLabel>
                <FieldContent>
                  <Select v-model="formData.activeThemeId">
                    <SelectTrigger class="w-56">
                      <span class="truncate">
                        {{
                          themes.find((t) => t.id === formData.activeThemeId)?.name ??
                          formData.activeThemeId
                        }}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="t in themes"
                        :key="t.id"
                        :value="t.id"
                      >
                        {{ t.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>开机自启</FieldLabel>
                <FieldContent>
                  <Switch v-model="formData.autoLaunch" />
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <FieldLabel>关闭窗口时</FieldLabel>
                <FieldContent>
                  <Select v-model="formData.mainWindowCloseAction">
                    <SelectTrigger class="w-56">
                      <span class="truncate">
                        {{
                          formData.mainWindowCloseAction === 'exit'
                            ? '退出应用'
                            : '最小化到托盘'
                        }}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exit">退出应用</SelectItem>
                      <SelectItem value="tray">最小化到托盘</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              :disabled="isSaving"
              @click="open = false"
            >
              取消
            </Button>
            <Button
              type="submit"
              :disabled="isSaving"
            >
              保存
            </Button>
          </DialogFooter>
        </Form>
      </template>
    </DialogContent>
  </Dialog>
</template>
