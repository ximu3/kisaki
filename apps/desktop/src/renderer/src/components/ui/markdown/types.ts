export interface MarkdownEditorAttachmentItem {
  url: string
  alt?: string
}

export type MarkdownEditorOnAttachment = () => Promise<MarkdownEditorAttachmentItem[]>
