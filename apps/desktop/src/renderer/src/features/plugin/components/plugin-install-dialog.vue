<script setup lang="ts">
/**
 * Plugin Install Dialog
 *
 * Dialog for installing plugins from various sources.
 * Supports: GitHub (owner/repo), URL, Local file.
 */

import { ref, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { notify } from '@renderer/core/notify'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldDescription } from '@renderer/components/ui/field'
import { Spinner } from '@renderer/components/ui/spinner'
import { ipcManager } from '@renderer/core/ipc'

type InstallMethod = 'github' | 'url' | 'local'

interface Emits {
  (e: 'installed'): void
}

const emit = defineEmits<Emits>()
const open = defineModel<boolean>('open', { required: true })

const method = ref<InstallMethod>('github')
const installing = ref(false)

// GitHub method state
const githubRepo = ref('')

// URL method state
const pluginUrl = ref('')

// Reset form when dialog opens
watch(open, (isOpen) => {
  if (isOpen) {
    method.value = 'github'
    githubRepo.value = ''
    pluginUrl.value = ''
    installing.value = false
  }
})

async function handleInstallFromGitHub() {
  if (!githubRepo.value.trim()) {
    notify.error('请输入仓库地址')
    return
  }

  // Validate format: owner/repo
  const repoPattern = /^[\w.-]+\/[\w.-]+$/
  if (!repoPattern.test(githubRepo.value.trim())) {
    notify.error('格式错误', '请使用 owner/repo 格式')
    return
  }

  installing.value = true
  try {
    const source = `github:${githubRepo.value.trim()}`
    const res = await ipcManager.invoke('plugin:install', source)
    if (!res.success) {
      notify.error('安装失败', res.error)
      return
    }

    notify.success('插件安装成功')
    githubRepo.value = ''
    open.value = false
    emit('installed')
  } finally {
    installing.value = false
  }
}

async function handleInstallFromUrl() {
  if (!pluginUrl.value.trim()) {
    notify.error('请输入下载地址')
    return
  }

  // Basic URL validation
  try {
    new URL(pluginUrl.value.trim())
  } catch {
    notify.error('格式错误', '请输入有效的 URL')
    return
  }

  installing.value = true
  try {
    const res = await ipcManager.invoke('plugin:install', pluginUrl.value.trim())
    if (!res.success) {
      notify.error('安装失败', res.error)
      return
    }

    notify.success('插件安装成功')
    pluginUrl.value = ''
    open.value = false
    emit('installed')
  } finally {
    installing.value = false
  }
}

async function handleInstallFromFile() {
  installing.value = true
  try {
    const res = await ipcManager.invoke('native:open-dialog', {
      title: '选择插件文件',
      filters: [{ name: '插件包', extensions: ['zip'] }],
      properties: ['openFile']
    })

    if (res.success && res.data && !res.data.canceled && res.data.filePaths.length > 0) {
      const filePath = res.data.filePaths[0]
      const installRes = await ipcManager.invoke('plugin:install-from-file', filePath)
      if (!installRes.success) {
        notify.error('安装失败', installRes.error)
        return
      }

      notify.success('插件安装成功')
      open.value = false
      emit('installed')
    }
  } finally {
    installing.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>安装插件</DialogTitle>
        <DialogDescription>选择安装来源以添加新插件</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Tabs v-model="method">
          <TabsList class="w-full">
            <TabsTrigger
              value="github"
              class="flex-1 gap-1.5"
            >
              <Icon
                icon="icon-[mdi--github]"
                class="size-4"
              />
              GitHub
            </TabsTrigger>
            <TabsTrigger
              value="url"
              class="flex-1 gap-1.5"
            >
              <Icon
                icon="icon-[mdi--link]"
                class="size-4"
              />
              URL
            </TabsTrigger>
            <TabsTrigger
              value="local"
              class="flex-1 gap-1.5"
            >
              <Icon
                icon="icon-[mdi--folder-open-outline]"
                class="size-4"
              />
              本地
            </TabsTrigger>
          </TabsList>

          <!-- GitHub installation -->
          <TabsContent
            value="github"
            class="space-y-4"
          >
            <Field>
              <FieldLabel>仓库地址</FieldLabel>
              <FieldDescription>输入 GitHub 仓库的 owner/repo 格式</FieldDescription>
              <FieldContent>
                <Input
                  v-model="githubRepo"
                  placeholder="例如: ximu3/vndb-scraper"
                  @keydown.enter="handleInstallFromGitHub"
                />
              </FieldContent>
            </Field>
          </TabsContent>

          <!-- URL installation -->
          <TabsContent
            value="url"
            class="space-y-4"
          >
            <Field>
              <FieldLabel>下载地址</FieldLabel>
              <FieldDescription>输入插件包 (.zip) 的直接下载链接</FieldDescription>
              <FieldContent>
                <Input
                  v-model="pluginUrl"
                  placeholder="https://example.com/plugin.zip"
                  @keydown.enter="handleInstallFromUrl"
                />
              </FieldContent>
            </Field>
          </TabsContent>

          <!-- Local installation -->
          <TabsContent
            value="local"
            class="space-y-4"
          >
            <div class="text-center py-6 border border-dashed border-border rounded-lg">
              <Icon
                icon="icon-[mdi--folder-zip-outline]"
                class="size-12 text-muted-foreground/50 mx-auto mb-3"
              />
              <p class="text-sm text-muted-foreground mb-4">选择本地插件包文件 (.zip)</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogBody>

      <DialogFooter>
        <Button
          v-if="method === 'github'"
          class="w-full"
          :disabled="installing || !githubRepo.trim()"
          @click="handleInstallFromGitHub"
        >
          <Spinner
            v-if="installing"
            class="size-4 mr-2"
          />
          安装
        </Button>
        <Button
          v-if="method === 'url'"
          class="w-full"
          :disabled="installing || !pluginUrl.trim()"
          @click="handleInstallFromUrl"
        >
          <Spinner
            v-if="installing"
            class="size-4 mr-2"
          />
          安装
        </Button>
        <Button
          v-if="method === 'local'"
          class="w-full"
          :disabled="installing"
          @click="handleInstallFromFile"
        >
          <Spinner
            v-if="installing"
            class="size-4 mr-2"
          />
          选择文件
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
