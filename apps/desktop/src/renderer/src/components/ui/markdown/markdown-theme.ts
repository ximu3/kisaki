import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'

/**
 * Creates a CodeMirror theme that integrates with the shadcn design system.
 * Uses CSS variables for colors to support both light and dark themes.
 */
export function createShadcnTheme(isDark: boolean): Extension {
  return createTheme({
    theme: isDark ? 'dark' : 'light',
    settings: {
      background: 'var(--card)',
      foreground: 'var(--card-foreground)',
      caret: 'var(--primary)',
      selection: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
      selectionMatch: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
      lineHighlight: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      gutterBackground: 'var(--card)',
      gutterForeground: 'var(--muted-foreground)',
      gutterBorder: 'transparent'
    },
    styles: [
      { tag: t.heading, color: isDark ? '#7dd3fc' : '#0369a1', fontWeight: '700' },
      { tag: t.strong, fontWeight: '700' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: t.strikethrough, color: isDark ? '#94a3b8' : '#64748b' },
      { tag: [t.link, t.url], color: 'var(--primary)' },
      { tag: t.quote, color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic' },
      { tag: t.monospace, color: isDark ? '#86efac' : '#15803d' },
      { tag: t.comment, color: isDark ? '#64748b' : '#94a3b8', fontStyle: 'italic' },
      { tag: t.invalid, color: 'var(--destructive)' }
    ]
  })
}

/**
 * Custom base theme for editor styling to match shadcn input components.
 */
export function createBaseTheme(minHeight: string, maxHeight: string): Extension {
  return EditorView.theme({
    '&': {
      fontSize: '12px',
      fontFamily: 'var(--font-mono)',
      maxHeight,
      borderRadius: '4px'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
      lineHeight: '1.6',
      minHeight,
      maxHeight,
      overflow: 'auto',

      // tailwind-scrollbar: .scrollbar-thin
      scrollbarWidth: 'thin',
      scrollbarColor: 'var(--scrollbar-thumb, initial) var(--scrollbar-track, initial)'
    },
    '.cm-scroller::-webkit-scrollbar': {
      display: 'block',
      width: '8px',
      height: '8px'
    },
    '.cm-scroller::-webkit-scrollbar-track': {
      backgroundColor: 'var(--scrollbar-track)',
      borderRadius: 'var(--scrollbar-track-radius)'
    },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--scrollbar-thumb)',
      borderRadius: 'var(--scrollbar-thumb-radius)'
    },
    '.cm-scroller::-webkit-scrollbar-corner': {
      backgroundColor: 'var(--scrollbar-corner)',
      borderRadius: 'var(--scrollbar-corner-radius)'
    },
    '.cm-content': {
      padding: '8px 0',
      caretColor: 'var(--primary)'
    },
    '.cm-line': {
      padding: '0 8px'
    },
    '.cm-placeholder': {
      color: 'var(--muted-foreground)',
      fontStyle: 'italic'
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--primary)'
    },
    '.cm-tooltip': {
      zIndex: '100'
    },
    '.cm-tooltip-autocomplete': {
      backgroundColor: 'var(--popover)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    },
    '.cm-tooltip-autocomplete ul': {
      fontFamily: 'var(--font-mono)',
      fontSize: '13px'
    },
    '.cm-tooltip-autocomplete ul li': {
      padding: '4px 8px'
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)'
    },
    '.cm-completionLabel': {
      color: 'var(--popover-foreground)'
    },
    '.cm-completionMatchedText': {
      color: 'var(--primary)',
      textDecoration: 'none',
      fontWeight: '600'
    }
  })
}
