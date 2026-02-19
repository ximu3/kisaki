import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'

const md = new MarkdownIt({
  breaks: true,
  html: true,
  linkify: true,
  typographer: true
})
  .use(taskLists, {
    enabled: true,
    label: true,
    labelAfter: true
  })
  .use(footnote)

function ensureRelNoopenerNoreferrer(rel?: string): string {
  const parts = new Set((rel ?? '').split(/\s+/).filter(Boolean))
  parts.add('noopener')
  parts.add('noreferrer')
  return Array.from(parts).join(' ')
}

function shouldOpenInNewTab(href?: string): boolean {
  if (!href) return false
  if (href.startsWith('#')) return false // footnotes / in-page anchors
  return true
}

const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]

  const hrefIndex = token.attrIndex('href')
  const href = hrefIndex < 0 || !token.attrs ? undefined : token.attrs[hrefIndex]?.[1]

  if (shouldOpenInNewTab(href)) {
    const targetIndex = token.attrIndex('target')
    if (targetIndex < 0) {
      token.attrPush(['target', '_blank'])
    } else if (token.attrs) {
      token.attrs[targetIndex][1] = '_blank'
    }

    const relIndex = token.attrIndex('rel')
    const currentRel = relIndex < 0 || !token.attrs ? undefined : token.attrs[relIndex]?.[1]
    const nextRel = ensureRelNoopenerNoreferrer(currentRel)
    if (relIndex < 0) {
      token.attrPush(['rel', nextRel])
    } else if (token.attrs) {
      token.attrs[relIndex][1] = nextRel
    }
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}

export function renderMarkdown(source: string): string {
  return md.render(source ?? '')
}
