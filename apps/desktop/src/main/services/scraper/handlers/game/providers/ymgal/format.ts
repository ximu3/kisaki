import type { GameCharacterType, GamePersonType, Gender } from '@shared/db'
import type { Locale } from '@shared/locale'
import type { ExternalId, Tag } from '@shared/metadata'
import type { YmgalWebsite } from './types'

const YMGAL_BASE_URL = 'https://www.ymgal.games'
const YMGAL_CDN_BASE_URL = 'https://cdn.ymgal.games'
const YMGAL_ID_REGEX = /^\d+$/
const DEFAULT_IMAGE_URL = '/archive/def_img.webp'

type RelatedSite = { label: string; url: string }

function trimValue(value: string | undefined | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized || undefined
}

function formatRelatedSiteLabel(value: string | undefined | null): string | undefined {
  const normalized = trimValue(value)
  if (!normalized) return undefined

  switch (normalized.toLowerCase()) {
    case 'steam':
      return 'Steam'
    case 'wikidata':
      return 'Wikidata'
    default:
      return normalized
  }
}

export function isChineseLocale(locale?: Locale): boolean {
  return locale === 'zh-Hans' || locale === 'zh-Hant'
}

export function normalizeYmgalId(value: string | number, label = 'YMGal id'): string {
  const raw = typeof value === 'number' ? String(value) : value.trim()
  if (!YMGAL_ID_REGEX.test(raw)) {
    throw new Error(`Invalid ${label}: ${value}`)
  }

  const normalized = String(Number.parseInt(raw, 10))
  if (!YMGAL_ID_REGEX.test(normalized) || normalized === '0') {
    throw new Error(`Invalid ${label}: ${value}`)
  }

  return normalized
}

export function toYmgalId(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value)
  }

  if (typeof value === 'string' && YMGAL_ID_REGEX.test(value.trim())) {
    const normalized = String(Number.parseInt(value.trim(), 10))
    return normalized === '0' ? undefined : normalized
  }

  return undefined
}

export function buildYmgalGameUrl(gameId: string): string {
  return `${YMGAL_BASE_URL}/GA${normalizeYmgalId(gameId, 'YMGal game id')}`
}

export function buildYmgalOrganizationUrl(orgId: string): string {
  return `${YMGAL_BASE_URL}/OA${normalizeYmgalId(orgId, 'YMGal organization id')}`
}

export function buildYmgalCharacterUrl(characterId: string): string {
  return `${YMGAL_BASE_URL}/CA${normalizeYmgalId(characterId, 'YMGal character id')}`
}

export function buildYmgalPersonUrl(personId: string): string {
  return `${YMGAL_BASE_URL}/PA${normalizeYmgalId(personId, 'YMGal person id')}`
}

export function resolveLocalizedName(
  name: string | undefined | null,
  chineseName: string | undefined | null,
  locale?: Locale
): { name: string; originalName?: string } {
  const original = trimValue(name)
  const chinese = trimValue(chineseName)

  if (isChineseLocale(locale) && chinese) {
    return {
      name: chinese,
      originalName: original
    }
  }

  if (original) {
    return { name: original, originalName: original }
  }

  if (chinese) {
    return { name: chinese, originalName: chinese }
  }

  return { name: 'Unknown' }
}

export function mapYmgalGender(value?: number | string | null): Gender | undefined {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value.trim())
        ? Number.parseInt(value.trim(), 10)
        : null

  switch (numeric) {
    case 1:
      return 'male'
    case 2:
      return 'female'
    case 3:
      return 'other'
    default:
      return undefined
  }
}

export function mapYmgalCharacterType(position?: number | null): GameCharacterType {
  if (position === 1) return 'main'
  if (position === 2) return 'supporting'
  return 'other'
}

export function mapYmgalStaffRole(jobName?: string | null): GamePersonType {
  const raw = (jobName || '').trim().toLowerCase()
  if (!raw) return 'other'

  const compact = raw.replace(/[\s_-]+/g, '')

  if (
    raw.includes('声优') ||
    raw.includes('配音') ||
    raw.includes('cv') ||
    raw.includes('voice') ||
    compact.includes('voiceactor') ||
    compact.includes('cast')
  ) {
    return 'actor'
  }

  if (
    raw.includes('音乐') ||
    raw.includes('作曲') ||
    raw.includes('作词') ||
    compact.includes('music') ||
    compact.includes('composer') ||
    compact.includes('song')
  ) {
    return 'music'
  }

  if (
    raw.includes('脚本') ||
    raw.includes('剧本') ||
    compact.includes('scenario') ||
    compact.includes('writer')
  ) {
    return 'scenario'
  }

  if (
    raw.includes('原画') ||
    raw.includes('立绘') ||
    raw.includes('美术') ||
    raw.includes('人设') ||
    raw.includes('角色设计') ||
    compact.includes('illustrat') ||
    compact.includes('art') ||
    compact.includes('characterdesign')
  ) {
    return 'illustration'
  }

  if (
    raw.includes('程序') ||
    raw.includes('引擎') ||
    compact.includes('program') ||
    compact.includes('engineer')
  ) {
    return 'programmer'
  }

  if (
    raw.includes('导演') ||
    raw.includes('监督') ||
    raw.includes('制作人') ||
    raw.includes('策划') ||
    compact.includes('director') ||
    compact.includes('producer')
  ) {
    return 'director'
  }

  return 'other'
}

export function resolveYmgalImageUrl(url?: string | null): string | undefined {
  const value = trimValue(url)
  if (!value) return undefined

  let normalized = value
  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`
  } else if (!/^https?:\/\//i.test(normalized)) {
    if (normalized.startsWith('/')) {
      normalized = `${YMGAL_CDN_BASE_URL}${normalized}`
    } else {
      normalized = `${YMGAL_CDN_BASE_URL}/${normalized}`
    }
  }

  try {
    return new URL(normalized).toString()
  } catch {
    return undefined
  }
}

export function normalizeUrl(url?: string | null): string | undefined {
  const value = trimValue(url)
  if (!value) return undefined

  let normalized = value
  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`
  }

  if (!/^https?:\/\//i.test(normalized)) {
    return undefined
  }

  try {
    return new URL(normalized).toString()
  } catch {
    return undefined
  }
}

function isPlaceholderImage(url: string): boolean {
  return url.includes(DEFAULT_IMAGE_URL)
}

export function dedupeUrls(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  for (const value of values) {
    const normalized = resolveYmgalImageUrl(value)
    if (!normalized || isPlaceholderImage(normalized) || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    output.push(normalized)
  }

  return output
}

export function dedupeRelatedSites(sites: RelatedSite[]): RelatedSite[] {
  const map = new Map<string, RelatedSite>()

  for (const site of sites) {
    const url = normalizeUrl(site.url)
    if (!url || map.has(url)) continue
    map.set(url, {
      label: trimValue(site.label) || 'Website',
      url
    })
  }

  return Array.from(map.values())
}

export function dedupeExternalIds(ids: ExternalId[]): ExternalId[] {
  const seen = new Set<string>()
  const output: ExternalId[] = []

  for (const item of ids) {
    const source = trimValue(item.source)?.toLowerCase()
    const id = trimValue(item.id)
    if (!source || !id) continue

    const key = `${source}:${id}`
    if (seen.has(key)) continue

    seen.add(key)
    output.push({ source, id })
  }

  return output
}

export function dedupeTags(tags: Tag[]): Tag[] {
  const seen = new Set<string>()
  const output: Tag[] = []

  for (const tag of tags) {
    const name = trimValue(tag.name)
    if (!name) continue

    const note = trimValue(tag.note) || ''
    const key = `${name.toLowerCase()}::${note.toLowerCase()}::${tag.isNsfw ? 'nsfw' : ''}::${tag.isSpoiler ? 'spoiler' : ''}`
    if (seen.has(key)) continue
    seen.add(key)

    output.push({
      ...tag,
      name,
      note: note || undefined
    })
  }

  return output
}

export function extractRelatedSitesFromWebsites(websites?: YmgalWebsite[] | null): RelatedSite[] {
  if (!websites?.length) return []

  return dedupeRelatedSites(
    websites
      .map((site) => {
        const url = normalizeUrl(site.link)
        if (!url) return null
        return {
          label: formatRelatedSiteLabel(site.title) || 'Website',
          url
        }
      })
      .filter((site): site is RelatedSite => !!site)
  )
}

export function extractExternalIdsFromSites(sites: RelatedSite[]): ExternalId[] {
  const externalIds: ExternalId[] = []

  for (const site of sites) {
    const url = site.url

    const ymgalMatch = url.match(/https?:\/\/(?:www\.)?ymgal\.games\/[a-z]{2}(\d+)/i)
    if (ymgalMatch?.[1]) {
      externalIds.push({ source: 'ymgal', id: ymgalMatch[1] })
    }

    const vndbMatch = url.match(/https?:\/\/(?:www\.)?vndb\.org\/([a-z]\d+(?:\.\d+)?)/i)
    if (vndbMatch?.[1]) {
      externalIds.push({ source: 'vndb', id: vndbMatch[1].toLowerCase() })
    }

    const bangumiMatch = url.match(/https?:\/\/(?:bgm\.tv|bangumi\.tv|chii\.in)\/\w+\/(\d+)/i)
    if (bangumiMatch?.[1]) {
      externalIds.push({ source: 'bangumi', id: bangumiMatch[1] })
    }

    const steamMatch = url.match(/https?:\/\/store\.steampowered\.com\/app\/(\d+)/i)
    if (steamMatch?.[1]) {
      externalIds.push({ source: 'steam', id: steamMatch[1] })
    }
  }

  return dedupeExternalIds(externalIds)
}
