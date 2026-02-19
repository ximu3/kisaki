/**
 * Name extraction presets (renderer-only UI helpers).
 *
 * These presets are only used by the renderer preset picker dialog.
 */

export interface NameExtractionPreset {
  id: string
  name: string
  description: string
  pattern: string
}

export const NAME_EXTRACTION_PRESETS: NameExtractionPreset[] = [
  {
    id: 'bracket-prefix',
    name: '方括号前缀 [xxx]',
    description: '移除开头的 [xxx]',
    pattern: '^\\[.*?\\]\\s*(?<name>.+)'
  },
  {
    id: 'paren-prefix',
    name: '圆括号前缀 (xxx)',
    description: '移除开头的 (xxx)',
    pattern: '^\\(.*?\\)\\s*(?<name>.+)'
  },
  {
    id: 'multi-bracket-prefix',
    name: '多重方括号前缀',
    description: '移除多个连续 [xxx]',
    pattern: '^(?:\\[.*?\\]\\s*)+(?<name>.+)'
  },
  {
    id: 'bracket-suffix',
    name: '方括号后缀 [xxx]',
    description: '移除结尾的 [xxx]',
    pattern: '^(?<name>.+?)\\s*\\[.*?\\]$'
  },
  {
    id: 'paren-suffix',
    name: '圆括号后缀 (xxx)',
    description: '移除结尾的 (xxx)',
    pattern: '^(?<name>.+?)\\s*\\(.*?\\)$'
  },
  {
    id: 'version-suffix',
    name: '版本号后缀 _vX.X',
    description: '移除 _v1.2.3',
    pattern: '^(?<name>.+?)_v[\\d.]+'
  },
  {
    id: 'year-suffix',
    name: '年份后缀 (YYYY)',
    description: '移除 (2024)',
    pattern: '^(?<name>.+?)\\s*\\(\\d{4}\\)$'
  },
  {
    id: 'lang-suffix',
    name: '语言后缀',
    description: '移除 CHS/CHT/JP/EN 等',
    pattern: '^(?<name>.+?)[-_](?:CHS|CHT|JP|EN|KR|SC|TC)(?:[-_]|$)'
  },
  {
    id: 'bracket-both',
    name: '前后方括号',
    description: '移除 [前缀] 和 [后缀]',
    pattern: '^\\[.*?\\]\\s*(?<name>.+?)\\s*\\[.*?\\]$'
  }
]
