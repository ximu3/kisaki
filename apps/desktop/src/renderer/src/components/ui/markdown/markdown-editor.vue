<script setup lang="ts">
import { computed, shallowRef, onUnmounted, ref, watch, nextTick } from 'vue'
import CodeMirror from 'vue-codemirror6'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView, keymap } from '@codemirror/view'
import { history, historyKeymap } from '@codemirror/commands'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import MarkdownContent from './markdown-content.vue'
import MarkdownEditorToolbar from './markdown-editor-toolbar.vue'
import type { MarkdownEditorOnAttachment } from './types'
import { cn } from '@renderer/utils'
import { createBaseTheme, createShadcnTheme } from './markdown-theme'
import {
  buildImageMarkdown,
  insertBlock as insertBlockInView,
  insertFootnote as insertFootnoteInView,
  insertHeading as insertHeadingInView,
  insertImageSyntax as insertImageSyntaxInView,
  insertLink as insertLinkInView,
  insertTable as insertTableInView,
  prefixSelectedLines as prefixSelectedLinesInView,
  replaceSelection as replaceSelectionInView,
  wrapSelection as wrapSelectionInView
} from './markdown-insert'

interface Props {
  placeholder?: string
  class?: string
  minHeight?: string
  maxHeight?: string
  readonly?: boolean
  autofocus?: boolean
  onAttachment?: MarkdownEditorOnAttachment
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  minHeight: '200px',
  maxHeight: '400px',
  readonly: false,
  autofocus: false
})

const model = defineModel<string>({ required: true })

const markdownLang = markdown()

type CodeMirrorReadyPayload = {
  view: EditorView
  state: EditorView['state']
  container: HTMLElement
}

const fullscreenOpen = ref(false)
const previewOpen = ref(false)

const inlineViewRef = shallowRef<EditorView | null>(null)
const fullscreenViewRef = shallowRef<EditorView | null>(null)

function onReadyInline(payload: CodeMirrorReadyPayload) {
  inlineViewRef.value = payload.view
}

function onReadyFullscreen(payload: CodeMirrorReadyPayload) {
  fullscreenViewRef.value = payload.view
}

const isDark = shallowRef(
  typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
)

let observer: MutationObserver | null = null

if (typeof document !== 'undefined') {
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
}

onUnmounted(() => {
  observer?.disconnect()
})

const extensions = computed(() => [
  createShadcnTheme(isDark.value),
  createBaseTheme(props.minHeight, props.maxHeight),
  history(),
  keymap.of(historyKeymap),
  EditorView.lineWrapping
])

const fullscreenExtensions = computed(() => [
  createShadcnTheme(isDark.value),
  createBaseTheme('100%', '100%'),
  EditorView.theme({
    '&': {
      height: '100%'
    },
    '.cm-scroller': {
      height: '100%'
    }
  }),
  history(),
  keymap.of(historyKeymap),
  EditorView.lineWrapping
])

function withView(fn: (view: EditorView) => void) {
  const view = fullscreenOpen.value ? fullscreenViewRef.value : inlineViewRef.value
  if (!view) return
  fn(view)
  view.focus()
}

function replaceSelection(text: string, range?: { from: number; to: number }) {
  withView((view) => replaceSelectionInView(view, text, range))
}

function wrapSelection(prefix: string, suffix: string) {
  withView((view) => wrapSelectionInView(view, prefix, suffix))
}

function insertBlock(block: string) {
  withView((view) => insertBlockInView(view, block))
}

function prefixSelectedLines(prefix: string) {
  withView((view) => prefixSelectedLinesInView(view, prefix))
}

function insertHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  withView((view) => insertHeadingInView(view, level))
}

function insertLink() {
  withView((view) => insertLinkInView(view))
}

function insertImageSyntax() {
  withView((view) => insertImageSyntaxInView(view))
}

function insertTable() {
  withView((view) => insertTableInView(view))
}

function insertFootnote() {
  withView((view) => insertFootnoteInView(view))
}

async function attachImage() {
  if (props.readonly) return
  if (!props.onAttachment) {
    throw new Error('MarkdownEditor: onAttachment is required when using attachment actions.')
  }

  const items = await props.onAttachment()
  if (!items || items.length === 0) return

  insertBlock(buildImageMarkdown(items))
}

defineExpose({
  replaceSelection,
  wrapSelection,
  insertBlock
})

watch(fullscreenOpen, async (open) => {
  if (open) {
    await nextTick()
    fullscreenViewRef.value?.focus()
    return
  }

  fullscreenViewRef.value = null
  await nextTick()
  inlineViewRef.value?.focus()
})
</script>

<template>
  <div
    :class="
      cn(
        'w-full rounded-md border border-border bg-card transition-colors',
        'focus-within:border-primary',
        props.readonly && 'opacity-50 cursor-not-allowed',
        props.class
      )
    "
  >
    <MarkdownEditorToolbar
      :readonly="props.readonly"
      :can-attach="!!props.onAttachment"
      show-preview
      show-fullscreen
      @wrap-selection="wrapSelection"
      @insert-block="insertBlock"
      @prefix-selected-lines="prefixSelectedLines"
      @insert-heading="insertHeading"
      @insert-link="insertLink"
      @insert-image-syntax="insertImageSyntax"
      @insert-table="insertTable"
      @insert-footnote="insertFootnote"
      @attach-image="attachImage"
      @preview="previewOpen = true"
      @fullscreen="fullscreenOpen = true"
    />

    <CodeMirror
      v-model="model"
      :lang="markdownLang"
      :placeholder="props.placeholder"
      :readonly="props.readonly"
      :autofocus="props.autofocus"
      :extensions="extensions"
      tab
      :tab-size="2"
      wrap
      @ready="onReadyInline"
    />
  </div>

  <Dialog v-model:open="fullscreenOpen">
    <DialogContent class="max-w-none w-full h-full overflow-hidden p-0 rounded-none border-0">
      <div class="flex h-full flex-col">
        <DialogHeader class="shrink-0">
          <DialogTitle>Markdown 编辑</DialogTitle>
        </DialogHeader>
        <MarkdownEditorToolbar
          class="shrink-0"
          :readonly="props.readonly"
          :can-attach="!!props.onAttachment"
          show-preview
          show-exit-fullscreen
          @wrap-selection="wrapSelection"
          @insert-block="insertBlock"
          @prefix-selected-lines="prefixSelectedLines"
          @insert-heading="insertHeading"
          @insert-link="insertLink"
          @insert-image-syntax="insertImageSyntax"
          @insert-table="insertTable"
          @insert-footnote="insertFootnote"
          @attach-image="attachImage"
          @preview="previewOpen = true"
          @exit-fullscreen="fullscreenOpen = false"
        />
        <div class="flex-1 min-h-0">
          <CodeMirror
            v-model="model"
            class="h-full"
            :lang="markdownLang"
            :placeholder="props.placeholder"
            :readonly="props.readonly"
            autofocus
            :extensions="fullscreenExtensions"
            tab
            :tab-size="2"
            wrap
            @ready="onReadyFullscreen"
          />
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="previewOpen">
    <DialogContent class="max-w-[90vw] w-[90vw]">
      <DialogHeader>
        <DialogTitle>预览</DialogTitle>
      </DialogHeader>
      <DialogBody class="max-h-[75vh] overflow-auto scrollbar-thin">
        <MarkdownContent :content="model" />
      </DialogBody>
    </DialogContent>
  </Dialog>
</template>
