export { default as MarkdownContent } from './markdown-content.vue'
export { default as MarkdownEditor } from './markdown-editor.vue'
export { default as MarkdownEditorToolbar } from './markdown-editor-toolbar.vue'

export {
  replaceSelection,
  wrapSelection,
  insertBlock,
  prefixSelectedLines,
  insertHeading,
  insertLink,
  insertImageSyntax,
  insertTable,
  insertFootnote,
  buildImageMarkdown
} from './markdown-insert'

export { renderMarkdown } from './markdown-render'
export { createShadcnTheme, createBaseTheme } from './markdown-theme'

export type { MarkdownEditorAttachmentItem, MarkdownEditorOnAttachment } from './types'
