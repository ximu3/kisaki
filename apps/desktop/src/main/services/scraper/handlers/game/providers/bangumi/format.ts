import type { ExternalId, Tag } from '@shared/metadata'
import type {
  BloodType,
  GameCharacterType,
  GameCompanyType,
  GamePersonType,
  PartialDate
} from '@shared/db'
import type { Locale } from '@shared/locale'
import type {
  BangumiBloodType,
  BangumiInfoboxItem,
  BangumiInfoboxValue,
  BangumiPersonCareer
} from './types'

export const BANGUMI_SUBJECT_TYPE_GAME = 4
const DEFAULT_SUBJECT_PLACEHOLDER_URL = 'https://lain.bgm.tv/img/no_icon_subject.png'
const URL_REGEX = /https?:\/\/[^\s<>"'()]+/gi

type RelatedSite = { label: string; url: string }
type CharacterMeasurements = {
  height?: number
  weight?: number
  bust?: number
  waist?: number
  hips?: number
}

export function parseBangumiId(id: string): number {
  const value = Number.parseInt(id, 10)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid Bangumi ID: ${id}`)
  }
  return value
}

export function buildBangumiSubjectUrl(subjectId: number): string {
  return `https://bgm.tv/subject/${subjectId}`
}

export function buildBangumiPersonUrl(personId: number): string {
  return `https://bgm.tv/person/${personId}`
}

export function buildBangumiCharacterUrl(characterId: number): string {
  return `https://bgm.tv/character/${characterId}`
}

export function isChineseLocale(locale?: Locale): boolean {
  return locale === 'zh-Hans' || locale === 'zh-Hant'
}

export function resolveLocalizedSubjectName(
  name: string,
  nameCn: string | undefined,
  locale?: Locale
): { name: string; originalName?: string } {
  const original = name.trim()
  const cn = nameCn?.trim() || ''

  if (isChineseLocale(locale) && cn) {
    return {
      name: cn,
      originalName: cn !== original ? original : undefined
    }
  }

  return { name: original || cn }
}

export function resolveLocalizedEntityName(
  name: string,
  infobox: BangumiInfoboxItem[] | null | undefined,
  locale?: Locale
): { name: string; originalName?: string } {
  const original = name.trim()
  const cn = extractChineseNameFromInfobox(infobox)?.trim()

  if (isChineseLocale(locale) && cn) {
    return {
      name: cn,
      originalName: original
    }
  }

  return { name: original, originalName: original }
}

export function toPartialDateFromParts(
  year?: number | null,
  month?: number | null,
  day?: number | null
): PartialDate | undefined {
  const y =
    Number.isInteger(year) && (year as number) > 0 && (year as number) < 3000 ? year : undefined
  const m =
    Number.isInteger(month) && (month as number) >= 1 && (month as number) <= 12 ? month : undefined
  const d = Number.isInteger(day) && (day as number) >= 1 && (day as number) <= 31 ? day : undefined

  if (y && m && d) return { year: y, month: m, day: d }
  if (y && m) return { year: y, month: m }
  if (y) return { year: y }
  if (m && d) return { month: m, day: d }
  return undefined
}

export function mapBangumiGender(gender?: string | null): 'male' | 'female' | 'other' | undefined {
  const raw = (gender || '').trim().toLowerCase()
  const normalized = normalizeToken(gender)
  if (!normalized) return undefined

  // Check female first because "female" contains "male" and "woman" contains "man".
  if (
    normalized.includes('female') ||
    normalized.includes('woman') ||
    normalized.includes('girl') ||
    raw.includes('女')
  ) {
    return 'female'
  }

  if (
    normalized.includes('male') ||
    normalized.includes('man') ||
    normalized.includes('boy') ||
    raw.includes('男')
  ) {
    return 'male'
  }

  if (normalized.includes('unknown') || raw.includes('未知')) {
    return undefined
  }

  return 'other'
}

export function extractCharacterMeasurementsFromInfobox(
  infobox: BangumiInfoboxItem[] | null | undefined
): CharacterMeasurements {
  if (!infobox?.length) {
    return {}
  }

  let height: number | undefined
  let weight: number | undefined
  let bust: number | undefined
  let waist: number | undefined
  let hips: number | undefined

  for (const item of infobox) {
    const keyRaw = item.key?.trim() || ''
    if (!keyRaw) continue

    const keyLower = keyRaw.toLowerCase()
    const keyNormalized = normalizeToken(keyRaw)
    const keyCompact = keyRaw.replace(/\s+/g, '')
    const values = flattenInfoboxValues(item.value)
    if (values.length === 0) continue

    if (isHeightKey(keyLower, keyCompact, keyNormalized) && height === undefined) {
      height = parseFirst(values, parseHeightValue)
      continue
    }

    if (isWeightKey(keyLower, keyCompact, keyNormalized) && weight === undefined) {
      weight = parseFirst(values, parseWeightValue)
      continue
    }

    if (isBwhKey(keyCompact, keyNormalized)) {
      for (const value of values) {
        const parsed = parseBwhValue(value)
        if (bust === undefined && parsed.bust !== undefined) bust = parsed.bust
        if (waist === undefined && parsed.waist !== undefined) waist = parsed.waist
        if (hips === undefined && parsed.hips !== undefined) hips = parsed.hips
      }
      continue
    }

    if (isBustKey(keyLower, keyCompact, keyNormalized)) {
      const parsed = parseFirst(values, parseCircumferenceValue)
      if (parsed !== undefined) bust = parsed
      continue
    }

    if (isWaistKey(keyLower, keyCompact, keyNormalized)) {
      const parsed = parseFirst(values, parseCircumferenceValue)
      if (parsed !== undefined) waist = parsed
      continue
    }

    if (isHipsKey(keyLower, keyCompact, keyNormalized)) {
      const parsed = parseFirst(values, parseCircumferenceValue)
      if (parsed !== undefined) hips = parsed
    }
  }

  return { height, weight, bust, waist, hips }
}

export function mapBangumiBloodType(bloodType?: BangumiBloodType | null): BloodType | undefined {
  switch (bloodType) {
    case 1:
      return 'a'
    case 2:
      return 'b'
    case 3:
      return 'ab'
    case 4:
      return 'o'
    default:
      return undefined
  }
}

export function mapBangumiCharacterRelation(relation?: string): GameCharacterType {
  const normalized = normalizeToken(relation)
  if (!normalized) return 'other'

  if (
    normalized.includes('主角') ||
    normalized.includes('main') ||
    normalized.includes('protagonist')
  ) {
    return 'main'
  }

  if (
    normalized.includes('配角') ||
    normalized.includes('support') ||
    normalized.includes('side')
  ) {
    return 'supporting'
  }

  if (
    normalized.includes('客串') ||
    normalized.includes('闲角') ||
    normalized.includes('旁白') ||
    normalized.includes('cameo')
  ) {
    return 'cameo'
  }

  return 'other'
}

export function mapBangumiPersonRole(
  relation?: string,
  careers: BangumiPersonCareer[] = []
): GamePersonType {
  const normalized = normalizeToken(relation)

  if (
    normalized.includes('音乐') ||
    normalized.includes('主题歌') ||
    normalized.includes('插入歌') ||
    normalized.includes('作曲') ||
    normalized.includes('作词') ||
    normalized.includes('音响') ||
    normalized.includes('vocal') ||
    normalized.includes('song') ||
    normalized.includes('composer')
  ) {
    return 'music'
  }

  if (
    normalized.includes('剧本') ||
    normalized.includes('脚本') ||
    normalized.includes('scenario') ||
    normalized.includes('writer') ||
    normalized.includes('原作') ||
    normalized.includes('系列构成')
  ) {
    return 'scenario'
  }

  if (
    normalized.includes('原画') ||
    normalized.includes('人物设定') ||
    normalized.includes('角色设定') ||
    normalized.includes('机械设定') ||
    normalized.includes('作画') ||
    normalized.includes('美术') ||
    normalized.includes('美工') ||
    normalized.includes('背景') ||
    normalized.includes('cg') ||
    normalized.includes('illustrat') ||
    normalized.includes('artist') ||
    normalized.includes('chardesign')
  ) {
    return 'illustration'
  }

  if (
    normalized.includes('程序') ||
    normalized.includes('程式') ||
    normalized.includes('program') ||
    normalized.includes('engine')
  ) {
    return 'programmer'
  }

  if (
    normalized.includes('导演') ||
    normalized.includes('監督') ||
    normalized.includes('监督') ||
    normalized.includes('总指挥') ||
    normalized.includes('總指揮') ||
    normalized.includes('director') ||
    normalized.includes('制作人') ||
    normalized.includes('制作总指挥') ||
    normalized.includes('监修')
  ) {
    return 'director'
  }

  if (
    normalized.includes('声优') ||
    normalized.includes('配音') ||
    normalized.includes('actor') ||
    careers.some((career) => {
      const normalizedCareer = normalizeToken(career)
      return normalizedCareer === 'seiyu' || normalizedCareer === 'actor'
    })
  ) {
    return 'actor'
  }

  if (
    careers.some((career) => {
      const normalizedCareer = normalizeToken(career)
      return normalizedCareer === 'writer'
    })
  ) {
    return 'scenario'
  }

  if (
    careers.some((career) => {
      const normalizedCareer = normalizeToken(career)
      return normalizedCareer === 'illustrator' || normalizedCareer === 'mangaka'
    })
  ) {
    return 'illustration'
  }

  if (
    careers.some((career) => {
      const normalizedCareer = normalizeToken(career)
      return normalizedCareer === 'artist'
    })
  ) {
    return 'music'
  }

  if (
    careers.some((career) => {
      const normalizedCareer = normalizeToken(career)
      return normalizedCareer === 'producer'
    })
  ) {
    return 'director'
  }

  return 'other'
}

export function mapBangumiCompanyRole(relation?: string): GameCompanyType {
  const normalized = normalizeToken(relation)
  if (!normalized) return 'other'

  if (
    normalized.includes('开发') ||
    normalized.includes('開発') ||
    normalized.includes('developer') ||
    normalized.includes('制作会社') ||
    normalized.includes('动画制作')
  ) {
    return 'developer'
  }

  if (
    normalized.includes('发行') ||
    normalized.includes('發行') ||
    normalized.includes('publisher') ||
    normalized.includes('販売')
  ) {
    return 'publisher'
  }

  if (
    normalized.includes('协力') ||
    normalized.includes('協力') ||
    normalized.includes('distribution') ||
    normalized.includes('distribut') ||
    normalized.includes('代理')
  ) {
    return 'distributor'
  }

  return 'other'
}

export function mapBangumiCareersToTags(careers: BangumiPersonCareer[] = []): Tag[] {
  const labels: Record<string, string> = {
    producer: 'Producer',
    mangaka: 'Mangaka',
    artist: 'Artist',
    seiyu: 'Voice Actor',
    writer: 'Writer',
    illustrator: 'Illustrator',
    actor: 'Actor'
  }

  return dedupeTags(
    careers
      .map((career) => normalizeToken(career))
      .filter(Boolean)
      .map((career) => ({
        name: labels[career] ?? career,
        note: 'Career'
      }))
  )
}

export function composeBangumiRoleNote(relation?: string, eps?: string): string | undefined {
  const relationText = relation?.trim()
  const epsText = eps?.trim()

  if (!relationText && !epsText) {
    return undefined
  }

  if (relationText && epsText) {
    return `${relationText} | ${epsText}`
  }

  return relationText || epsText
}

export function extractImageUrls(
  images?: {
    large?: string
    common?: string
    medium?: string
    small?: string
    grid?: string
  } | null
): string[] {
  if (!images) return []

  return dedupeUrls([images.large, images.common, images.medium, images.small, images.grid])
}

export function dedupeUrls(urls: Array<string | undefined | null>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of urls) {
    const normalized = normalizeUrl(raw)
    if (!normalized || isPlaceholderImage(normalized)) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }

  return result
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
  const result: ExternalId[] = []

  for (const id of ids) {
    const source = id.source?.trim().toLowerCase()
    const value = id.id?.trim()
    if (!source || !value) continue

    const key = `${source}:${value}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ source, id: value })
  }

  return result
}

export function dedupeTags(tags: Tag[]): Tag[] {
  const seen = new Set<string>()
  const result: Tag[] = []

  for (const tag of tags) {
    const name = tag.name?.trim()
    if (!name) continue
    const note = tag.note?.trim() || ''
    const key = `${name.toLowerCase()}::${note.toLowerCase()}::${tag.isNsfw ? 'nsfw' : ''}::${tag.isSpoiler ? 'spoiler' : ''}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      ...tag,
      name,
      note: note || undefined
    })
  }

  return result
}

export function extractRelatedSitesFromInfobox(
  infobox: BangumiInfoboxItem[] | null | undefined
): RelatedSite[] {
  if (!infobox?.length) return []

  const sites: RelatedSite[] = []

  for (const item of infobox) {
    const itemLabel = normalizeRelatedSiteLabel(item.key) || 'Website'
    if (typeof item.value === 'string') {
      for (const url of extractUrls(item.value)) {
        sites.push({ label: itemLabel, url })
      }
      continue
    }

    if (!Array.isArray(item.value)) continue

    for (const entry of item.value) {
      const entryLabel = normalizeRelatedSiteLabel(entry.k) || itemLabel
      const value = entry.v?.trim()
      if (!value) continue

      for (const url of extractUrls(value)) {
        sites.push({ label: entryLabel, url })
      }
    }
  }

  return dedupeRelatedSites(sites)
}

export function extractExternalIdsFromSites(sites: RelatedSite[]): ExternalId[] {
  const externalIds: ExternalId[] = []

  for (const site of sites) {
    const url = site.url

    const vndbMatch = url.match(/https?:\/\/(?:www\.)?vndb\.org\/([a-z]\d+)/i)
    if (vndbMatch?.[1]) {
      externalIds.push({ source: 'vndb', id: vndbMatch[1] })
    }

    const steamMatch = url.match(/https?:\/\/store\.steampowered\.com\/app\/(\d+)/i)
    if (steamMatch?.[1]) {
      externalIds.push({ source: 'steam', id: steamMatch[1] })
    }

    const ymgalMatch = url.match(/https?:\/\/(?:www\.)?ymgal\.games\/[A-Z]{2}(\d+)/i)
    if (ymgalMatch?.[1]) {
      externalIds.push({ source: 'ymgal', id: ymgalMatch[1] })
    }
  }

  return dedupeExternalIds(externalIds)
}

export function extractInfoboxValuesByKeys(
  infobox: BangumiInfoboxItem[] | null | undefined,
  keys: string[]
): string[] {
  if (!infobox?.length || keys.length === 0) {
    return []
  }

  const normalizedKeys = keys.map((key) => key.toLowerCase())
  const values: string[] = []

  for (const item of infobox) {
    const lowerKey = item.key?.toLowerCase() || ''
    if (!normalizedKeys.some((key) => lowerKey.includes(key))) continue
    values.push(...flattenInfoboxValues(item.value))
  }

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !isLikelyUrl(value))
}

function isHeightKey(lower: string, compact: string, normalized: string): boolean {
  return (
    normalized.includes('height') ||
    compact.includes('身高') ||
    compact.includes('身長') ||
    lower.includes('height')
  )
}

function isWeightKey(lower: string, compact: string, normalized: string): boolean {
  return (
    normalized.includes('weight') ||
    compact.includes('体重') ||
    compact.includes('體重') ||
    lower.includes('weight')
  )
}

function isBwhKey(compact: string, normalized: string): boolean {
  return (
    normalized === 'bwh' ||
    normalized.includes('bwh') ||
    compact.includes('三围') ||
    compact.includes('三圍')
  )
}

function isBustKey(lower: string, compact: string, normalized: string): boolean {
  return (
    normalized.includes('bust') ||
    compact.includes('胸围') ||
    compact.includes('胸圍') ||
    compact.includes('バスト') ||
    /\bbust\b/.test(lower)
  )
}

function isWaistKey(lower: string, compact: string, normalized: string): boolean {
  return (
    normalized.includes('waist') ||
    compact.includes('腰围') ||
    compact.includes('腰圍') ||
    compact.includes('ウエスト') ||
    /\bwaist\b/.test(lower)
  )
}

function isHipsKey(lower: string, compact: string, normalized: string): boolean {
  return (
    normalized.includes('hips') ||
    normalized === 'hip' ||
    compact.includes('臀围') ||
    compact.includes('臀圍') ||
    compact.includes('ヒップ') ||
    /\bhips?\b/.test(lower)
  )
}

function parseFirst(
  values: string[],
  parser: (value: string) => number | undefined
): number | undefined {
  for (const value of values) {
    const parsed = parser(value)
    if (parsed !== undefined) {
      return parsed
    }
  }
  return undefined
}

function parseBwhValue(value: string): Pick<CharacterMeasurements, 'bust' | 'waist' | 'hips'> {
  const normalized = normalizeMeasurementText(value)

  const bust = parseCircumferenceValue(
    getCapture(normalized, /(?:^|[^a-z])b\s*([0-9]+(?:\.[0-9]+)?)/i)
  )
  const waist = parseCircumferenceValue(
    getCapture(normalized, /(?:^|[^a-z])w\s*([0-9]+(?:\.[0-9]+)?)/i)
  )
  const hips = parseCircumferenceValue(
    getCapture(normalized, /(?:^|[^a-z])h\s*([0-9]+(?:\.[0-9]+)?)/i)
  )

  if (bust !== undefined || waist !== undefined || hips !== undefined) {
    return { bust, waist, hips }
  }

  const numbers = extractNumericValues(normalized)
  if (numbers.length >= 3) {
    return {
      bust: clampMeasurement(numbers[0], 40, 180),
      waist: clampMeasurement(numbers[1], 30, 150),
      hips: clampMeasurement(numbers[2], 40, 180)
    }
  }

  return {}
}

function parseHeightValue(value: string): number | undefined {
  const normalized = normalizeMeasurementText(value).toLowerCase()

  const cmValue = getCapture(normalized, /([0-9]+(?:\.[0-9]+)?)\s*(?:cm|厘米|公分|センチ|㎝)\b/i)
  if (cmValue) {
    return clampMeasurement(Number(cmValue), 30, 300)
  }

  const meterValue = getCapture(normalized, /([0-9]+(?:\.[0-9]+)?)\s*m\b/i)
  if (meterValue) {
    return clampMeasurement(Number(meterValue) * 100, 30, 300)
  }

  const first = extractNumericValues(normalized)[0]
  return clampMeasurement(first, 30, 300)
}

function parseWeightValue(value: string): number | undefined {
  const normalized = normalizeMeasurementText(value).toLowerCase()

  const kgValue = getCapture(normalized, /([0-9]+(?:\.[0-9]+)?)\s*(?:kg|公斤|千克|㎏)\b/i)
  if (kgValue) {
    return clampMeasurement(Number(kgValue), 10, 500)
  }

  const lbValue = getCapture(normalized, /([0-9]+(?:\.[0-9]+)?)\s*(?:lb|lbs|磅)\b/i)
  if (lbValue) {
    return clampMeasurement(Number(lbValue) * 0.45359237, 10, 500)
  }

  const first = extractNumericValues(normalized)[0]
  return clampMeasurement(first, 10, 500)
}

function parseCircumferenceValue(value: string | undefined): number | undefined {
  if (!value) return undefined
  const normalized = normalizeMeasurementText(value).toLowerCase()

  const cmValue = getCapture(normalized, /([0-9]+(?:\.[0-9]+)?)\s*(?:cm|厘米|公分|センチ|㎝)\b/i)
  if (cmValue) {
    return clampMeasurement(Number(cmValue), 20, 200)
  }

  const first = extractNumericValues(normalized)[0]
  return clampMeasurement(first, 20, 200)
}

function extractNumericValues(value: string): number[] {
  const matches = value.match(/[0-9]+(?:\.[0-9]+)?/g)
  if (!matches) return []
  return matches
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry) && entry > 0)
}

function normalizeMeasurementText(value: string): string {
  return value
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[．]/g, '.')
    .replace(/[／]/g, '/')
    .replace(/[，]/g, ',')
    .replace(/[－—–～〜]/g, '-')
    .trim()
}

function getCapture(value: string, regex: RegExp): string | undefined {
  const match = value.match(regex)
  const captured = match?.[1]?.trim()
  return captured || undefined
}

function clampMeasurement(value: number | undefined, min: number, max: number): number | undefined {
  if (!Number.isFinite(value as number)) return undefined
  const parsed = value as number
  if (parsed < min || parsed > max) return undefined

  const rounded = Math.round(parsed * 10) / 10
  return Number.isInteger(rounded) ? Math.trunc(rounded) : rounded
}

function extractChineseNameFromInfobox(
  infobox: BangumiInfoboxItem[] | null | undefined
): string | undefined {
  if (!infobox?.length) return undefined

  for (const item of infobox) {
    const key = item.key?.trim()
    if (!key) continue

    if (key === '简体中文名' || key === '中文名') {
      const values = flattenInfoboxValues(item.value)
      const first = values.find((value) => value.trim())
      if (first) return first.trim()
    }

    if (key === '别名' && Array.isArray(item.value)) {
      for (const entry of item.value) {
        const subKey = (entry as BangumiInfoboxValue).k?.trim()
        if (!subKey) continue
        if (subKey.includes('中文名')) {
          const value = (entry as BangumiInfoboxValue).v?.trim()
          if (value) return value
        }
      }
    }
  }

  return undefined
}

function flattenInfoboxValues(value: string | BangumiInfoboxValue[]): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry) => entry.v?.trim()).filter((entry): entry is string => !!entry)
}

function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  if (!matches) return []
  return matches.map((url) => normalizeUrl(url)).filter((url): url is string => !!url)
}

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim())
}

function isPlaceholderImage(url: string): boolean {
  return url.includes(DEFAULT_SUBJECT_PLACEHOLDER_URL)
}

function normalizeUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  let value = raw.trim()
  if (!value) return undefined

  value = value.replace(/[),.;]+$/g, '')

  if (!/^https?:\/\//i.test(value)) {
    return undefined
  }

  try {
    const normalized = new URL(value).toString()
    return normalized
  } catch {
    return undefined
  }
}

function normalizeRelatedSiteLabel(raw: string | undefined | null): string | undefined {
  const label = raw?.trim()
  if (!label) return undefined

  if (label.toLowerCase() === 'website') {
    return 'Official Website'
  }

  if (label.toLowerCase() === 'blog') {
    return 'Blog'
  }

  return label
}

function normalizeToken(value: string | undefined | null): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s·・:：/_-]+/g, '')
}
