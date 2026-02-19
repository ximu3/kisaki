import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core'
import { unref, type Ref } from 'vue'
import { ipcManager } from '@renderer/core/ipc'
import { attachment } from '@renderer/core/db'
import { getOpenImageDialogOptions } from '@renderer/utils/dialog'
import type { FilesColumns } from '@shared/db/attachment'
import type { MarkdownEditorAttachmentItem } from '@renderer/components/ui/markdown'

export interface UseInlineAttachmentsOptions<TTable extends SQLiteTable> {
  table: TTable
  rowId: string | Ref<string>
  field: FilesColumns<TTable>
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function useInlineAttachments<TTable extends SQLiteTable>(
  options: UseInlineAttachmentsOptions<TTable>
) {
  const tableName = getTableConfig(options.table).name
  const pending = new Set<string>()
  let baselineContent: string | null = null

  function setBaselineContent(content: string) {
    baselineContent = content ?? ''
  }

  function extractReferencedFileNames(content: string): Set<string> {
    const rowId = unref(options.rowId)
    const safeTable = escapeRegExp(tableName)
    const safeRowId = escapeRegExp(rowId)

    const out = new Set<string>()
    const re = new RegExp(`attachment://${safeTable}/${safeRowId}/([^\\s)"'<>]+)`, 'g')
    for (const match of content.matchAll(re)) {
      const raw = match[1]
      const fileName = raw.split(/[?#]/)[0]
      if (fileName) out.add(fileName)
    }
    return out
  }

  async function pickPaths(): Promise<string[]> {
    const dialogOptions = getOpenImageDialogOptions({
      title: 'Select images'
    })

    const res = await ipcManager.invoke('native:open-dialog', {
      ...dialogOptions,
      properties: ['openFile', 'multiSelections']
    })

    if (!res.success) {
      throw new Error(res.error || 'Failed to open file dialog')
    }
    if (!res.data || res.data.canceled || !res.data.filePaths || res.data.filePaths.length === 0) {
      return []
    }
    return res.data.filePaths
  }

  async function onAttachment(): Promise<MarkdownEditorAttachmentItem[]> {
    const rowId = unref(options.rowId)
    const paths = await pickPaths()
    if (paths.length === 0) return []

    const items: MarkdownEditorAttachmentItem[] = []
    for (const filePath of paths) {
      const fileName = await attachment.addFile(options.table, rowId, options.field, {
        kind: 'path',
        path: filePath
      })

      pending.add(fileName)
      items.push({ url: `attachment://${tableName}/${rowId}/${fileName}` })
    }

    return items
  }

  async function gcToMatchContent(content: string): Promise<void> {
    const rowId = unref(options.rowId)
    const used = extractReferencedFileNames(content ?? '')
    const current = await attachment.listFiles(options.table, rowId, options.field)

    const toDelete = current.filter((fileName) => !used.has(fileName))
    for (const fileName of toDelete) {
      await attachment.removeFile(options.table, rowId, options.field, fileName)
      pending.delete(fileName)
    }
  }

  async function gcOnSave(nextContent: string): Promise<void> {
    await gcToMatchContent(nextContent ?? '')
    baselineContent = nextContent ?? ''
    pending.clear()
  }

  async function gcOnCancel(): Promise<void> {
    if (baselineContent === null) return
    await gcToMatchContent(baselineContent)
    pending.clear()
  }

  return {
    setBaselineContent,
    onAttachment,
    gcOnSave,
    gcOnCancel
  } as const
}
