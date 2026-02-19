import type {
  PartialDate,
  BloodType,
  CupSize,
  GameCharacterType,
  GamePersonType,
  Gender
} from '@shared/db'
import type { Locale } from '@shared/locale'
import type { ExternalId, Tag } from '@shared/metadata'
import type { VndbExtlink, VndbSchemaEnumEntry, VndbTitle } from './types'

const VNDB_BASE_URL = 'https://vndb.org'
const VNDB_ID_REGEX = /^[a-z]\d+(?:\.\d+)?$/i

const EXTLINK_SOURCE_MAP: Record<string, string> = {
  bgmtv: 'bangumi',
  steam: 'steam',
  igdb: 'igdb',
  ymgal: 'ymgal',
  vndb: 'vndb'
}

type RelatedSite = { label: string; url: string }

export function buildVndbVnUrl(id: string): string {
  return `${VNDB_BASE_URL}/${id}`
}

export function buildVndbCharacterUrl(id: string): string {
  return `${VNDB_BASE_URL}/${id}`
}

export function buildVndbStaffUrl(id: string): string {
  return `${VNDB_BASE_URL}/${id}`
}

export function buildVndbProducerUrl(id: string): string {
  return `${VNDB_BASE_URL}/${id}`
}

export function normalizeVndbId(
  id: string,
  prefix: 'v' | 'c' | 's' | 'p' | 'g' | 'i' = 'v'
): string {
  const raw = id.trim().toLowerCase()
  if (!raw) {
    throw new Error(`Invalid VNDB id: ${id}`)
  }

  if (VNDB_ID_REGEX.test(raw)) {
    return raw
  }

  if (/^\d+$/.test(raw)) {
    return `${prefix}${raw}`
  }

  throw new Error(`Invalid VNDB id: ${id}`)
}

export function isChineseLocale(locale?: Locale): boolean {
  return locale === 'zh-Hans' || locale === 'zh-Hant'
}

function isEnglishLocale(locale?: Locale): boolean {
  return locale === 'en'
}

type ResolvedVndbTitle = {
  lang?: string
  title: string
  isMain: boolean
}

const CHINESE_TITLE_LANGS = new Set(['zh-Hans', 'zh-Hant', 'zh'])

function normalizeVndbTitles(titles?: VndbTitle[] | null): ResolvedVndbTitle[] {
  return (titles ?? [])
    .map((entry) => ({
      lang: entry?.lang?.trim() || undefined,
      title: entry?.title?.trim() || '',
      isMain: entry?.main === true
    }))
    .filter((entry) => entry.title.length > 0)
}

function pickLocalizedVndbTitle(titles: ResolvedVndbTitle[], locale?: Locale): string | undefined {
  if (!locale) return undefined

  const exactMain = titles.find((item) => item.lang === locale && item.isMain)?.title
  if (exactMain) return exactMain

  const exact = titles.find((item) => item.lang === locale)?.title
  if (exact) return exact

  if (!isChineseLocale(locale)) return undefined

  const chineseMain = titles.find(
    (item) => item.lang && CHINESE_TITLE_LANGS.has(item.lang) && item.isMain
  )?.title
  if (chineseMain) return chineseMain

  return titles.find((item) => item.lang && CHINESE_TITLE_LANGS.has(item.lang))?.title
}

export function resolveLocalizedVnName(
  source: {
    title?: string | null
    alttitle?: string | null
    titles?: VndbTitle[] | null
  },
  locale?: Locale
): { name: string; originalName?: string } {
  const romanTitle = source.title?.trim() || ''
  const fallbackTitle = romanTitle || source.alttitle?.trim() || ''
  const titles = normalizeVndbTitles(source.titles)
  const mainTitle = titles.find((item) => item.isMain)?.title
  const localizedTitle = pickLocalizedVndbTitle(titles, locale)
  const resolvedTitle =
    localizedTitle ||
    (isEnglishLocale(locale) ? romanTitle || mainTitle : mainTitle) ||
    fallbackTitle
  const name = resolvedTitle.trim()

  if (!name) {
    return { name: 'Unknown' }
  }

  if (mainTitle) {
    return {
      name,
      originalName: mainTitle
    }
  }

  return { name }
}

export function resolveVndbEntityName(
  name?: string | null,
  original?: string | null,
  locale?: Locale
): { name: string; originalName?: string } {
  const normalizedName = name?.trim() || ''
  const normalizedOriginal = original?.trim() || ''
  const resolvedName =
    locale === 'en' ? normalizedName || normalizedOriginal : normalizedOriginal || normalizedName

  if (!resolvedName) {
    return { name: 'Unknown' }
  }

  if (normalizedOriginal) {
    return { name: resolvedName, originalName: normalizedOriginal }
  }

  return { name: resolvedName }
}

export function sanitizeVndbText(value: string | null | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined
  }

  let text = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  text = text.replace(/\[raw\]([\s\S]*?)\[\/raw\]/gi, (_, content: string) => content)

  text = text.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, (_, url: string, label: string) => {
    const normalizedLabel = label.trim()
    const normalizedUrl = url.trim()
    if (!normalizedLabel) return normalizedUrl
    if (!normalizedUrl || normalizedLabel === normalizedUrl) return normalizedLabel
    return `${normalizedLabel} (${normalizedUrl})`
  })
  text = text.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_, link: string) => link.trim())

  text = text.replace(/\[(?:nl|br)\]/gi, '\n')
  text = text.replace(/\[quote\]/gi, '\n')
  text = text.replace(/\[\/quote\]/gi, '\n')
  text = text.replace(/\[list\]/gi, '')
  text = text.replace(/\[\/list\]/gi, '')
  text = text.replace(/\[\*\]/g, '\n- ')

  text = text.replace(/\[\/?(?:b|i|u|s|code|spoiler)\]/gi, '')
  text = text.replace(/\[\/?[a-z]+(?:=[^\]]+)?\]/gi, '')

  text = text.replace(/[ \t]+\n/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.trim()

  return text || undefined
}

export function toPartialDateFromMonthDay(
  birthday?: [number | null, number | null] | null
): PartialDate | undefined {
  if (!birthday || birthday.length < 2) {
    return undefined
  }

  const month = birthday[0]
  const day = birthday[1]
  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return undefined
  }

  const normalizedMonth = month as number
  const normalizedDay = day as number

  if (normalizedMonth < 1 || normalizedMonth > 12 || normalizedDay < 1 || normalizedDay > 31) {
    return undefined
  }

  return { month: normalizedMonth, day: normalizedDay }
}

function normalizeVndbScalar(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || undefined
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return undefined
}

function normalizeVndbArrayToken(
  value?: string | number | Array<string | number | null> | null
): string | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeVndbScalar(entry)
      if (normalized) return normalized
    }
    return undefined
  }

  return normalizeVndbScalar(value)
}

export function mapVndbGender(
  gender?: string | number | Array<string | number | null> | null
): Gender | undefined {
  const token = normalizeVndbArrayToken(gender)?.toLowerCase()
  switch (token) {
    case 'm':
    case 'male':
      return 'male'
    case 'f':
    case 'female':
      return 'female'
    case 'b':
    case 'other':
      return 'other'
    default:
      return undefined
  }
}

export function mapVndbDevStatus(
  value?: string | number | Array<string | number | null> | null
): string | undefined {
  const token = normalizeVndbArrayToken(value)?.toLowerCase()
  if (!token) return undefined

  if (token === '0') return 'Finished'
  if (token === '1') return 'In development'
  if (token === '2') return 'Cancelled'

  return normalizeVndbArrayToken(value)
}

export function mapVndbBloodType(value?: string | null): BloodType | undefined {
  const normalized = (value || '').trim().toLowerCase()
  if (normalized === 'a' || normalized === 'b' || normalized === 'ab' || normalized === 'o') {
    return normalized
  }
  return undefined
}

export function mapVndbCup(value?: string | null): CupSize | undefined {
  const normalized = (value || '').trim().toLowerCase()
  const validCupSizes: CupSize[] = [
    'aaa',
    'aa',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k'
  ]

  return validCupSizes.includes(normalized as CupSize) ? (normalized as CupSize) : undefined
}

export function mapVndbCharacterRole(role?: string | null): GameCharacterType {
  switch ((role || '').trim().toLowerCase()) {
    case 'main':
    case 'primary':
      return 'main'
    case 'side':
      return 'supporting'
    case 'appears':
      return 'cameo'
    default:
      return 'other'
  }
}

export function mapVndbStaffRole(role?: string | null): GamePersonType {
  switch ((role || '').trim().toLowerCase()) {
    case 'scenario':
      return 'scenario'
    case 'director':
      return 'director'
    case 'chardesign':
    case 'art':
      return 'illustration'
    case 'music':
    case 'songs':
      return 'music'
    default:
      return 'other'
  }
}

export function mapVndbProducerType(value?: string | null): string | undefined {
  switch ((value || '').trim().toLowerCase()) {
    case 'co':
      return 'Company'
    case 'in':
      return 'Individual'
    case 'ng':
      return 'Amateur Group'
    default:
      return undefined
  }
}

export function mapVndbTagCategory(value?: string | null): string | undefined {
  switch ((value || '').trim().toLowerCase()) {
    case 'cont':
      return 'Content'
    case 'ero':
      return 'Erotic'
    case 'tech':
      return 'Technical'
    default:
      return undefined
  }
}

export function mapVndbLength(value?: number | null): string | undefined {
  switch (value) {
    case 1:
      return 'Very short'
    case 2:
      return 'Short'
    case 3:
      return 'Medium'
    case 4:
      return 'Long'
    case 5:
      return 'Very long'
    default:
      return undefined
  }
}

export function extractRelatedSitesFromExtlinks(extlinks?: VndbExtlink[] | null): RelatedSite[] {
  if (!extlinks?.length) {
    return []
  }

  return dedupeRelatedSites(
    extlinks
      .map((entry) => {
        const url = normalizeUrl(entry.url)
        if (!url) return null
        return {
          label: entry.label?.trim() || entry.name?.trim() || 'Website',
          url
        }
      })
      .filter((item): item is RelatedSite => !!item)
  )
}

function extractMatchedExternalIdsFromUrl(url: string): ExternalId[] {
  const matched: ExternalId[] = []

  const vndbMatch = url.match(/https?:\/\/(?:www\.)?vndb\.org\/([a-z]\d+(?:\.\d+)?)/i)
  if (vndbMatch?.[1]) {
    matched.push({ source: 'vndb', id: vndbMatch[1].toLowerCase() })
  }

  const steamMatch = url.match(/https?:\/\/store\.steampowered\.com\/app\/(\d+)/i)
  if (steamMatch?.[1]) {
    matched.push({ source: 'steam', id: steamMatch[1] })
  }

  const bangumiMatch = url.match(/https?:\/\/(?:bgm\.tv|bangumi\.tv|chii\.in)\/\w+\/(\d+)/i)
  if (bangumiMatch?.[1]) {
    matched.push({ source: 'bangumi', id: bangumiMatch[1] })
  }

  const ymgalMatch = url.match(/https?:\/\/(?:www\.)?ymgal\.games\/[A-Z]{2}(\d+)/i)
  if (ymgalMatch?.[1]) {
    matched.push({ source: 'ymgal', id: ymgalMatch[1] })
  }

  return matched
}

export function extractExternalIdsFromExtlinks(extlinks?: VndbExtlink[] | null): ExternalId[] {
  if (!extlinks?.length) {
    return []
  }

  const externalIds: ExternalId[] = []

  for (const extlink of extlinks) {
    const url = normalizeUrl(extlink.url)
    if (!url) continue

    const matchedExternalIds = extractMatchedExternalIdsFromUrl(url)
    if (matchedExternalIds.length === 0) continue

    const sourceName = (extlink.name || '').trim().toLowerCase()
    const mappedSource = sourceName ? EXTLINK_SOURCE_MAP[sourceName] : undefined

    if (mappedSource) {
      externalIds.push(...matchedExternalIds.filter((item) => item.source === mappedSource))
      continue
    }

    externalIds.push(...matchedExternalIds)
  }

  return dedupeExternalIds(externalIds)
}

export function buildEnumLabelMap(values?: VndbSchemaEnumEntry[] | null): Map<string, string> {
  const map = new Map<string, string>()
  for (const value of values ?? []) {
    const id = value.id?.trim()
    const label = value.label?.trim()
    if (!id || !label) continue
    map.set(id, label)
  }
  return map
}

export function buildIdOrFilter(ids: string[]): unknown {
  const normalized = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
  if (normalized.length === 0) {
    throw new Error('Cannot build ID filter with empty ids')
  }
  if (normalized.length === 1) {
    return ['id', '=', normalized[0]]
  }
  return ['or', ...normalized.map((id) => ['id', '=', id])]
}

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) return [items]
  const output: T[][] = []
  for (let i = 0; i < items.length; i += chunkSize) {
    output.push(items.slice(i, i + chunkSize))
  }
  return output
}

export function mergeNotes(existing?: string, incoming?: string): string | undefined {
  const left = existing?.trim()
  const right = incoming?.trim()
  if (!left) return right || undefined
  if (!right) return left
  if (left === right) return left
  return `${left}; ${right}`
}

export function toFiniteNumber(value?: number | null): number | undefined {
  if (!Number.isFinite(value as number)) return undefined
  const normalized = value as number
  return normalized > 0 ? normalized : undefined
}

export function dedupeUrls(urls: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  for (const raw of urls) {
    const normalized = normalizeUrl(raw)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    output.push(normalized)
  }

  return output
}

export function dedupeRelatedSites(sites: RelatedSite[]): RelatedSite[] {
  const map = new Map<string, RelatedSite>()
  for (const site of sites) {
    const url = normalizeUrl(site.url)
    if (!url) continue
    if (!map.has(url)) {
      map.set(url, {
        label: site.label?.trim() || 'Website',
        url
      })
    }
  }
  return Array.from(map.values())
}

export function dedupeExternalIds(ids: ExternalId[]): ExternalId[] {
  const seen = new Set<string>()
  const output: ExternalId[] = []

  for (const item of ids) {
    const source = item.source?.trim().toLowerCase()
    const id = item.id?.trim()
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
    const name = tag.name?.trim()
    if (!name) continue
    const note = tag.note?.trim() || ''
    const key = `${name.toLowerCase()}::${note.toLowerCase()}::${tag.isSpoiler ? 'spoiler' : ''}::${tag.isNsfw ? 'nsfw' : ''}`
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

function normalizeUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined

  try {
    return new URL(url.trim()).toString()
  } catch {
    return undefined
  }
}
