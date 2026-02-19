<!--
  CompanyMediaCropFormDialog
  Dialog for cropping company logo image.
  Uses the reusable ImageCropperDialog component.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { attachment } from '@renderer/core/db'
import { ipcManager } from '@renderer/core/ipc'
import { notify } from '@renderer/core/notify'
import { companies } from '@shared/db'
import { ImageCropperDialog, type CropConfirmPayload } from '@renderer/components/ui/image-cropper-dialog'

type CompanyMediaType = 'logo'

interface Props {
  companyId: string
  mediaType: CompanyMediaType
  currentFileName: string
}

const props = defineProps<Props>()

const open = defineModel<boolean>('open', { required: true })

const isCropping = ref(false)

const imageSrc = computed(() => `attachment://companies/${props.companyId}/${props.currentFileName}`)
const MEDIA_TYPE_LABEL: Record<CompanyMediaType, string> = {
  logo: 'Logo'
}
const MEDIA_TYPE_TO_ASPECT: Record<CompanyMediaType, number | undefined> = {
  logo: 1
}
const MEDIA_TYPE_TO_ASPECT_LABEL: Record<CompanyMediaType, string | undefined> = {
  logo: '1:1'
}

const dialogTitle = computed(() => `裁剪${MEDIA_TYPE_LABEL[props.mediaType]}`)
const aspectRatio = computed(() => MEDIA_TYPE_TO_ASPECT[props.mediaType])
const aspectLabel = computed(() => MEDIA_TYPE_TO_ASPECT_LABEL[props.mediaType])

async function handleConfirm(payload: CropConfirmPayload) {
  isCropping.value = true

  try {
    const sourcePath = await attachment.getPath('companies', props.companyId, props.currentFileName)

    const croppedResult = await ipcManager.invoke(
      'attachment:crop-to-temp',
      { kind: 'path', path: sourcePath },
      payload.pixels,
      { format: 'keep' }
    )
    if (!croppedResult.success) {
      notify.error('裁剪失败', croppedResult.error)
      return
    }

    await attachment.setFile(companies, props.companyId, 'logoFile', {
      kind: 'path',
      path: croppedResult.data
    })

    notify.success('媒体已更新')
    open.value = false
  } catch (error) {
    notify.error('裁剪失败', (error as Error).message)
  } finally {
    isCropping.value = false
  }
}
</script>

<template>
  <ImageCropperDialog
    v-model:open="open"
    :src="imageSrc"
    :title="dialogTitle"
    :aspect-ratio="aspectRatio"
    :aspect-label="aspectLabel"
    :loading="isCropping"
    @confirm="handleConfirm"
  />
</template>
