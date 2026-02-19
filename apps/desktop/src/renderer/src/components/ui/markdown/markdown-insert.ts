import { EditorView } from '@codemirror/view'
import type { MarkdownEditorAttachmentItem } from './types'

export function replaceSelection(
  view: EditorView,
  text: string,
  range?: { from: number; to: number }
) {
  const sel = range ?? view.state.selection.main
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: { anchor: sel.from + text.length }
  })
}

export function wrapSelection(view: EditorView, prefix: string, suffix: string) {
  const sel = view.state.selection.main
  const selected = view.state.doc.sliceString(sel.from, sel.to)
  const insert = `${prefix}${selected}${suffix}`
  const anchor = sel.from + prefix.length
  const head = sel.from + prefix.length + selected.length
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: selected.length > 0 ? { anchor, head } : { anchor }
  })
}

export function insertBlock(view: EditorView, block: string) {
  const sel = view.state.selection.main
  const before = view.state.doc.sliceString(Math.max(0, sel.from - 1), sel.from)
  const after = view.state.doc.sliceString(sel.to, Math.min(view.state.doc.length, sel.to + 1))
  const prefix = before === '' || before === '\n' ? '' : '\n'
  const suffix = after === '' || after === '\n' ? '' : '\n'
  const insert = `${prefix}${block}${suffix}`
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: { anchor: sel.from + prefix.length + block.length }
  })
}

export function prefixSelectedLines(view: EditorView, prefix: string) {
  const sel = view.state.selection.main
  const fromLine = view.state.doc.lineAt(sel.from)
  const toLine = view.state.doc.lineAt(sel.to)

  const changes: { from: number; to: number; insert: string }[] = []
  for (let pos = fromLine.from; pos <= toLine.from; ) {
    const line = view.state.doc.lineAt(pos)
    changes.push({ from: line.from, to: line.from, insert: prefix })
    if (line.number === toLine.number) break
    pos = line.to + 1
  }

  view.dispatch({ changes })
}

export function insertHeading(view: EditorView, level: 1 | 2 | 3 | 4 | 5 | 6) {
  prefixSelectedLines(view, `${'#'.repeat(level)} `)
}

export function insertLink(view: EditorView) {
  const sel = view.state.selection.main
  const selected = view.state.doc.sliceString(sel.from, sel.to) || 'text'
  const insert = `[${selected}](url)`
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: { anchor: sel.from + insert.length - 4, head: sel.from + insert.length - 1 }
  })
}

export function insertImageSyntax(view: EditorView) {
  const sel = view.state.selection.main
  const insert = `![alt](url)`
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert },
    selection: { anchor: sel.from + 2, head: sel.from + 5 }
  })
}

export function insertTable(view: EditorView) {
  insertBlock(view, `| Column | Column |\n| --- | --- |\n|  |  |`)
}

export function insertFootnote(view: EditorView) {
  const doc = view.state.doc.toString()
  const used = [...doc.matchAll(/\[\^(\d+)\]:/g)].map((m) => Number(m[1])).filter(Number.isFinite)
  const next = used.length > 0 ? Math.max(...used) + 1 : 1
  const ref = `[^${next}]`
  const def = `\n\n[^${next}]: `
  const hasDef = new RegExp(`\\[\\^${next}\\]:`).test(doc)

  const sel = view.state.selection.main
  view.dispatch({
    changes: [
      { from: sel.from, to: sel.to, insert: ref },
      ...(hasDef ? [] : [{ from: view.state.doc.length, to: view.state.doc.length, insert: def }])
    ],
    selection: { anchor: sel.from + ref.length }
  })
}

export function buildImageMarkdown(items: MarkdownEditorAttachmentItem[]): string {
  return items.map((i) => `![${i.alt ?? ''}](${i.url})`).join('\n')
}
