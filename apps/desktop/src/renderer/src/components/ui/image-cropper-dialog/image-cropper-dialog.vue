<!--
  ImageCropperDialog
  A reusable dialog for cropping images with optional aspect ratio lock.
  Provides a visual cropper with draggable/resizable selection area.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@renderer/components/ui/icon'
import { cn } from '@renderer/utils'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import type { CropConfirmPayload, CropRegion, NormalizedCropRegion } from './types'

interface Props {
  /** Image source URL */
  src: string
  /** Dialog title */
  title?: string
  /** Aspect ratio to enforce (e.g. 3/4, 16/9). Undefined = free crop */
  aspectRatio?: number
  /** Whether to show aspect ratio lock toggle. Only effective when aspectRatio is set */
  allowFreeAspect?: boolean
  /** Display label for the aspect ratio (e.g. "3:4", "16:9") */
  aspectLabel?: string
  /** Loading state for confirm button */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '裁剪图片',
  allowFreeAspect: true
})

const emit = defineEmits<{
  confirm: [payload: CropConfirmPayload]
}>()

const open = defineModel<boolean>('open', { required: true })

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
type InteractionMode = 'idle' | 'move' | 'resize'
type RectPx = { x: number; y: number; width: number; height: number }

const stageRef = ref<HTMLDivElement | null>(null)
const cropBoxRef = ref<HTMLDivElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const imageLoaded = ref(false)
const lockAspect = ref(true)

const crop = ref<NormalizedCropRegion>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
const stageSize = ref({ width: 0, height: 0 })

const mode = ref<InteractionMode>('idle')
const activePointerId = ref<number | null>(null)
const activeResizeHandle = ref<ResizeHandle | null>(null)
const pointerStart = ref({ x: 0, y: 0 })
const cropStartPx = ref<RectPx>({ x: 0, y: 0, width: 0, height: 0 })

let stageResizeObserver: ResizeObserver | null = null

const effectiveAspect = computed(() =>
  props.aspectRatio && lockAspect.value ? props.aspectRatio : undefined
)

const MIN_CROP_SIZE_PX = 32
const HANDLE_OUTSET_PX = 6

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normalizeCropRegion(n: NormalizedCropRegion) {
  const width = clamp(n.width, 0, 1)
  const height = clamp(n.height, 0, 1)
  const x = clamp(n.x, 0, Math.max(0, 1 - width))
  const y = clamp(n.y, 0, Math.max(0, 1 - height))
  return { x, y, width, height }
}

function getStageSizeOrNull() {
  const { width, height } = stageSize.value
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return { width, height }
}

function updateStageSize() {
  if (!stageRef.value) return
  const rect = stageRef.value.getBoundingClientRect()
  stageSize.value = { width: rect.width, height: rect.height }
}

function ensureStageObserver() {
  if (!stageRef.value) return
  if (stageResizeObserver) return
  stageResizeObserver = new ResizeObserver(() => updateStageSize())
  stageResizeObserver.observe(stageRef.value)
}

function normalizedToPx(n: NormalizedCropRegion, stage: { width: number; height: number }): RectPx {
  return {
    x: n.x * stage.width,
    y: n.y * stage.height,
    width: n.width * stage.width,
    height: n.height * stage.height
  }
}

function pxToNormalized(px: RectPx, stage: { width: number; height: number }): NormalizedCropRegion {
  return {
    x: px.x / stage.width,
    y: px.y / stage.height,
    width: px.width / stage.width,
    height: px.height / stage.height
  }
}

function clampRectToStage(rect: RectPx, stage: { width: number; height: number }, minSizePx: number) {
  const width = clamp(rect.width, minSizePx, stage.width)
  const height = clamp(rect.height, minSizePx, stage.height)
  const x = clamp(rect.x, 0, Math.max(0, stage.width - width))
  const y = clamp(rect.y, 0, Math.max(0, stage.height - height))
  return { x, y, width, height }
}

function centeredRectForAspect(
  stage: { width: number; height: number },
  ratio: number,
  options?: { insetPx?: number; scale?: number }
) {
  const insetPx = options?.insetPx ?? HANDLE_OUTSET_PX
  const scale = options?.scale ?? 0.9

  const maxWidth = Math.max(0, stage.width - insetPx * 2) * scale
  const maxHeight = Math.max(0, stage.height - insetPx * 2) * scale

  let width = maxWidth
  let height = width / ratio
  if (height > maxHeight) {
    height = maxHeight
    width = height * ratio
  }

  return clampRectToStage(
    {
      x: (stage.width - width) / 2,
      y: (stage.height - height) / 2,
      width,
      height
    },
    stage,
    MIN_CROP_SIZE_PX
  )
}

function fitCropToAspectKeepingCenterPx(
  current: NormalizedCropRegion,
  stage: { width: number; height: number },
  ratio: number
) {
  const rect0 = normalizedToPx(current, stage)
  const cx0 = rect0.x + rect0.width / 2
  const cy0 = rect0.y + rect0.height / 2

  const candidateFromWidth = { width: rect0.width, height: rect0.width / ratio }
  const candidateFromHeight = { width: rect0.height * ratio, height: rect0.height }

  const diffWidth =
    Math.abs(candidateFromWidth.width - rect0.width) + Math.abs(candidateFromWidth.height - rect0.height)
  const diffHeight =
    Math.abs(candidateFromHeight.width - rect0.width) + Math.abs(candidateFromHeight.height - rect0.height)

  let width = (diffWidth <= diffHeight ? candidateFromWidth : candidateFromHeight).width
  let height = width / ratio

  if (width > stage.width) {
    width = stage.width
    height = width / ratio
  }
  if (height > stage.height) {
    height = stage.height
    width = height * ratio
  }

  const minWidthPx = Math.max(MIN_CROP_SIZE_PX, MIN_CROP_SIZE_PX * ratio)
  const minHeightPx = Math.max(MIN_CROP_SIZE_PX, MIN_CROP_SIZE_PX / ratio)
  width = clamp(width, Math.min(minWidthPx, stage.width), stage.width)
  height = clamp(height, Math.min(minHeightPx, stage.height), stage.height)

  const rect = clampRectToStage(
    { x: cx0 - width / 2, y: cy0 - height / 2, width, height },
    stage,
    MIN_CROP_SIZE_PX
  )

  return normalizeCropRegion(pxToNormalized(rect, stage))
}

function startInteraction(e: PointerEvent, nextMode: Exclude<InteractionMode, 'idle'>, handle?: ResizeHandle) {
  if (!imageLoaded.value) return
  const stage = getStageSizeOrNull()
  if (!stage) return
  if (!cropBoxRef.value) return

  mode.value = nextMode
  activePointerId.value = e.pointerId
  activeResizeHandle.value = handle ?? null
  pointerStart.value = { x: e.clientX, y: e.clientY }
  cropStartPx.value = normalizedToPx(crop.value, stage)

  cropBoxRef.value.setPointerCapture(e.pointerId)
}

function stopInteraction() {
  mode.value = 'idle'
  activePointerId.value = null
  activeResizeHandle.value = null
}

function applyMove(deltaPx: { dx: number; dy: number }, stage: { width: number; height: number }) {
  const rect = clampRectToStage(
    {
      x: cropStartPx.value.x + deltaPx.dx,
      y: cropStartPx.value.y + deltaPx.dy,
      width: cropStartPx.value.width,
      height: cropStartPx.value.height
    },
    stage,
    MIN_CROP_SIZE_PX
  )
  crop.value = normalizeCropRegion(pxToNormalized(rect, stage))
}

function applyResizeFree(
  deltaPx: { dx: number; dy: number },
  stage: { width: number; height: number },
  handle: ResizeHandle
) {
  const left0 = cropStartPx.value.x
  const top0 = cropStartPx.value.y
  const right0 = cropStartPx.value.x + cropStartPx.value.width
  const bottom0 = cropStartPx.value.y + cropStartPx.value.height

  let left = left0
  let top = top0
  let right = right0
  let bottom = bottom0

  if (handle.includes('w')) left = left0 + deltaPx.dx
  if (handle.includes('e')) right = right0 + deltaPx.dx
  if (handle.includes('n')) top = top0 + deltaPx.dy
  if (handle.includes('s')) bottom = bottom0 + deltaPx.dy

  if (handle.includes('w')) left = clamp(left, 0, right - MIN_CROP_SIZE_PX)
  if (handle.includes('e')) right = clamp(right, left + MIN_CROP_SIZE_PX, stage.width)
  if (handle.includes('n')) top = clamp(top, 0, bottom - MIN_CROP_SIZE_PX)
  if (handle.includes('s')) bottom = clamp(bottom, top + MIN_CROP_SIZE_PX, stage.height)

  const rect = clampRectToStage(
    { x: left, y: top, width: right - left, height: bottom - top },
    stage,
    MIN_CROP_SIZE_PX
  )
  crop.value = normalizeCropRegion(pxToNormalized(rect, stage))
}

function applyResizeAspect(
  deltaPx: { dx: number; dy: number },
  stage: { width: number; height: number },
  handle: ResizeHandle,
  ratio: number
) {
  const left0 = cropStartPx.value.x
  const top0 = cropStartPx.value.y
  const right0 = cropStartPx.value.x + cropStartPx.value.width
  const bottom0 = cropStartPx.value.y + cropStartPx.value.height
  const centerX0 = left0 + cropStartPx.value.width / 2
  const centerY0 = top0 + cropStartPx.value.height / 2

  const minWidthPx = Math.max(MIN_CROP_SIZE_PX, MIN_CROP_SIZE_PX * ratio)
  const minHeightPx = Math.max(MIN_CROP_SIZE_PX, MIN_CROP_SIZE_PX / ratio)

  // Edges: opposite-edge anchored; orthogonal axis grows/shrinks around the center.
  if (handle === 'e' || handle === 'w') {
    const dx = handle === 'e' ? deltaPx.dx : -deltaPx.dx
    const maxWidthByX = handle === 'e' ? stage.width - left0 : right0
    const maxWidthByY = stage.height * ratio
    const maxWidth = Math.max(0, Math.min(maxWidthByX, maxWidthByY))
    const width = clamp(cropStartPx.value.width + dx, Math.min(minWidthPx, maxWidth), maxWidth)
    const height = width / ratio
    const left = handle === 'e' ? left0 : right0 - width
    const top = clamp(centerY0 - height / 2, 0, Math.max(0, stage.height - height))
    crop.value = normalizeCropRegion(pxToNormalized({ x: left, y: top, width, height }, stage))
    return
  }

  if (handle === 'n' || handle === 's') {
    const dy = handle === 's' ? deltaPx.dy : -deltaPx.dy
    const maxHeightByY = handle === 's' ? stage.height - top0 : bottom0
    const maxHeightByX = stage.width / ratio
    const maxHeight = Math.max(0, Math.min(maxHeightByY, maxHeightByX))
    const height = clamp(cropStartPx.value.height + dy, Math.min(minHeightPx, maxHeight), maxHeight)
    const width = height * ratio
    const top = handle === 's' ? top0 : bottom0 - height
    const left = clamp(centerX0 - width / 2, 0, Math.max(0, stage.width - width))
    crop.value = normalizeCropRegion(pxToNormalized({ x: left, y: top, width, height }, stage))
    return
  }

  // Corners: opposite corner anchored.
  const maxWidth =
    handle === 'se'
      ? Math.min(stage.width - left0, (stage.height - top0) * ratio)
      : handle === 'ne'
        ? Math.min(stage.width - left0, bottom0 * ratio)
        : handle === 'sw'
          ? Math.min(right0, (stage.height - top0) * ratio)
          : Math.min(right0, bottom0 * ratio)

  const width0 = cropStartPx.value.width
  const height0 = cropStartPx.value.height

  const targetW =
    handle === 'se' || handle === 'ne'
      ? width0 + deltaPx.dx
      : width0 - deltaPx.dx
  const targetH =
    handle === 'se' || handle === 'sw'
      ? height0 + deltaPx.dy
      : height0 - deltaPx.dy

  const denom = ratio * ratio + 1
  const projectedW = (targetW * ratio * ratio + targetH * ratio) / denom

  const width = clamp(projectedW, Math.min(minWidthPx, maxWidth), maxWidth)
  const height = width / ratio
  const left = handle.includes('w') ? right0 - width : left0
  const top = handle.includes('n') ? bottom0 - height : top0

  crop.value = normalizeCropRegion(pxToNormalized({ x: left, y: top, width, height }, stage))
}

function onPointerMove(e: PointerEvent) {
  if (activePointerId.value === null || e.pointerId !== activePointerId.value) return
  const stage = getStageSizeOrNull()
  if (!stage) return

  const dx = e.clientX - pointerStart.value.x
  const dy = e.clientY - pointerStart.value.y

  if (mode.value === 'move') {
    applyMove({ dx, dy }, stage)
    return
  }

  if (mode.value === 'resize') {
    const handle = activeResizeHandle.value ?? 'se'
    const ratio = effectiveAspect.value
    if (!ratio) {
      applyResizeFree({ dx, dy }, stage, handle)
      return
    }
    applyResizeAspect({ dx, dy }, stage, handle, ratio)
  }
}

function onPointerUp(e: PointerEvent) {
  if (activePointerId.value === null || e.pointerId !== activePointerId.value) return
  stopInteraction()
}

function onPointerDownMove(e: PointerEvent) {
  e.preventDefault()
  e.stopPropagation()
  startInteraction(e, 'move')
}

function onPointerDownResize(e: PointerEvent, handle: ResizeHandle) {
  e.preventDefault()
  e.stopPropagation()
  startInteraction(e, 'resize', handle)
}

function onImageLoad() {
  imageLoaded.value = true
  nextTick(() => {
    updateStageSize()
    ensureStageObserver()
    const stage = getStageSizeOrNull()
    if (!stage) return
    const ratio = effectiveAspect.value
    if (ratio) {
      crop.value = normalizeCropRegion(pxToNormalized(centeredRectForAspect(stage, ratio), stage))
    } else {
      crop.value = { x: 0.1, y: 0.1, width: 0.8, height: 0.8 }
    }
  })
}

function handleConfirm() {
  if (!imgRef.value) return
  const image = imgRef.value

  const natural = { width: image.naturalWidth, height: image.naturalHeight }
  const pixels: CropRegion = {
    x: Math.round(crop.value.x * natural.width),
    y: Math.round(crop.value.y * natural.height),
    width: Math.round(crop.value.width * natural.width),
    height: Math.round(crop.value.height * natural.height)
  }

  emit('confirm', {
    normalized: { ...crop.value },
    pixels,
    natural
  })
}

function handleClose() {
  open.value = false
}

const cropBoxStyle = computed(() => ({
  left: `${crop.value.x * 100}%`,
  top: `${crop.value.y * 100}%`,
  width: `${crop.value.width * 100}%`,
  height: `${crop.value.height * 100}%`
}))

const overlayStyleTop = computed(() => ({
  left: '0%',
  top: '0%',
  width: '100%',
  height: `${crop.value.y * 100}%`
}))

const overlayStyleBottom = computed(() => {
  const top = (crop.value.y + crop.value.height) * 100
  return {
    left: '0%',
    top: `${top}%`,
    width: '100%',
    height: `${Math.max(0, 100 - top)}%`
  }
})

const overlayStyleLeft = computed(() => ({
  left: '0%',
  top: `${crop.value.y * 100}%`,
  width: `${crop.value.x * 100}%`,
  height: `${crop.value.height * 100}%`
}))

const overlayStyleRight = computed(() => {
  const left = (crop.value.x + crop.value.width) * 100
  return {
    left: `${left}%`,
    top: `${crop.value.y * 100}%`,
    width: `${Math.max(0, 100 - left)}%`,
    height: `${crop.value.height * 100}%`
  }
})

const cropInfo = computed(() => {
  if (!imgRef.value) return null
  const image = imgRef.value
  return {
    width: Math.round(crop.value.width * image.naturalWidth),
    height: Math.round(crop.value.height * image.naturalHeight)
  }
})

watch(
  () => [effectiveAspect.value, stageSize.value.width, stageSize.value.height] as const,
  ([ratio]) => {
    if (!imageLoaded.value) return
    if (!ratio) return
    if (mode.value !== 'idle') return
    const stage = getStageSizeOrNull()
    if (!stage) return
    crop.value = fitCropToAspectKeepingCenterPx(crop.value, stage, ratio)
  }
)

const cropCursorStyle = computed(() => {
  if (mode.value === 'resize' && activeResizeHandle.value) {
    return { cursor: `${activeResizeHandle.value}-resize` }
  }
  return { cursor: 'move' }
})

watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) {
      stopInteraction()
      return
    }
    if (!imageLoaded.value) return
    nextTick(() => updateStageSize())
  }
)

watch(
  () => props.src,
  () => {
    stopInteraction()
    imageLoaded.value = false
  }
)

onBeforeUnmount(() => {
  if (stageResizeObserver) {
    stageResizeObserver.disconnect()
    stageResizeObserver = null
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
      </DialogHeader>

      <DialogBody class="flex flex-col items-center gap-4">
        <!-- Aspect ratio control -->
        <div class="flex items-center gap-3 text-xs">
          <template v-if="props.aspectRatio && props.allowFreeAspect">
            <span class="text-muted-foreground">推荐比例: {{ props.aspectLabel ?? props.aspectRatio }}</span>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <Switch
                v-model="lockAspect"
                class="scale-75"
              />
              <span :class="cn(lockAspect ? 'text-foreground' : 'text-muted-foreground')">
                锁定比例
              </span>
            </label>
          </template>
          <template v-else-if="props.aspectRatio">
            <span class="text-muted-foreground">固定比例: {{ props.aspectLabel ?? props.aspectRatio }}</span>
          </template>
          <span
            v-else
            class="text-muted-foreground"
          >
            自由裁剪
          </span>
        </div>

        <!-- Crop area -->
        <div class="crop-container relative w-full max-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
          <div
            ref="stageRef"
            class="relative inline-block max-w-full"
          >
            <img
              ref="imgRef"
              :src="props.src"
              alt="Crop preview"
              :class="cn('block max-h-[400px] max-w-full w-auto select-none', !imageLoaded && 'invisible')"
              crossorigin="anonymous"
              draggable="false"
              @dragstart.prevent
              @load="onImageLoad"
            />

            <!-- Crop overlay (bounded to rendered image) -->
            <div
              v-if="imageLoaded"
              class="absolute inset-0 pointer-events-none"
            >
              <!-- Dark overlay outside crop area (bounded to rendered image) -->
              <div class="absolute inset-0">
                <div
                  class="absolute bg-black/50"
                  :style="overlayStyleTop"
                />
                <div
                  class="absolute bg-black/50"
                  :style="overlayStyleBottom"
                />
                <div
                  class="absolute bg-black/50"
                  :style="overlayStyleLeft"
                />
                <div
                  class="absolute bg-black/50"
                  :style="overlayStyleRight"
                />
              </div>

              <div
                ref="cropBoxRef"
                class="absolute bg-transparent border-2 border-white pointer-events-auto touch-none"
                :style="[cropBoxStyle, cropCursorStyle]"
                @pointerdown="onPointerDownMove"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
                @lostpointercapture="onPointerUp"
              >
                <!-- Grid lines -->
                <div class="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  <div class="border-r border-b border-white/30" />
                  <div class="border-r border-b border-white/30" />
                  <div class="border-b border-white/30" />
                  <div class="border-r border-b border-white/30" />
                  <div class="border-r border-b border-white/30" />
                  <div class="border-b border-white/30" />
                  <div class="border-r border-white/30" />
                  <div class="border-r border-white/30" />
                  <div />
                </div>

                <!-- Resize handles (always visible) -->
                <div
                  class="absolute -left-1.5 -top-1.5 size-3 bg-white rounded-full cursor-nw-resize"
                  @pointerdown="onPointerDownResize($event, 'nw')"
                />
                <div
                  class="absolute left-1/2 -top-1.5 -translate-x-1/2 size-3 bg-white rounded-full cursor-n-resize"
                  @pointerdown="onPointerDownResize($event, 'n')"
                />
                <div
                  class="absolute -right-1.5 -top-1.5 size-3 bg-white rounded-full cursor-ne-resize"
                  @pointerdown="onPointerDownResize($event, 'ne')"
                />

                <div
                  class="absolute -left-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full cursor-w-resize"
                  @pointerdown="onPointerDownResize($event, 'w')"
                />
                <div
                  class="absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full cursor-e-resize"
                  @pointerdown="onPointerDownResize($event, 'e')"
                />

                <div
                  class="absolute -left-1.5 -bottom-1.5 size-3 bg-white rounded-full cursor-sw-resize"
                  @pointerdown="onPointerDownResize($event, 'sw')"
                />
                <div
                  class="absolute left-1/2 -bottom-1.5 -translate-x-1/2 size-3 bg-white rounded-full cursor-s-resize"
                  @pointerdown="onPointerDownResize($event, 's')"
                />
                <div
                  class="absolute -right-1.5 -bottom-1.5 size-3 bg-white rounded-full cursor-se-resize"
                  @pointerdown="onPointerDownResize($event, 'se')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Crop info -->
        <div
          v-if="cropInfo"
          class="text-xs text-muted-foreground"
        >
          <span>裁剪区域: {{ cropInfo.width }} × {{ cropInfo.height }} px</span>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          @click="handleClose"
        >
          取消
        </Button>
        <Button
          :disabled="!imageLoaded || props.loading"
          @click="handleConfirm"
        >
          <template v-if="props.loading">
            <Icon
              icon="icon-[mdi--loading]"
              class="size-4 animate-spin"
            />
            处理中...
          </template>
          <template v-else>
            <Icon
              icon="icon-[mdi--crop]"
              class="size-4"
            />
            确认裁剪
          </template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
