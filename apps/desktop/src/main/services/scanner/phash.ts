import { app } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import phash from 'sharp-phash'
import type { ExternalId } from '@shared/metadata'
import type { FileIconSize, PhashIndexSpec } from './types'

export const PHASH_DB_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'phash.db')
  : path.join(app.getAppPath(), 'resources', 'phash.db')

export interface PhashDbRow {
  id: string
  name: string
  external_ids: string
  phash: string
}

export interface PhashDbRecord {
  id: string
  name: string
  externalIds: ExternalId[]
  hash: bigint
}

export interface PhashDbMatch {
  record: PhashDbRecord
  distance: number
  inputPhash: string
}

function getCacheKey(selectSql: string): string {
  return selectSql
}

function parseExternalIds(externalIdsJson: string): ExternalId[] {
  try {
    const parsed = JSON.parse(externalIdsJson) as unknown
    return Array.isArray(parsed) ? (parsed as ExternalId[]) : []
  } catch {
    return []
  }
}

export interface FilePhashItem {
  filePath: string
  phash: string
}

export function hammingDistance(a: bigint, b: bigint): number {
  let xor = a ^ b
  let distance = 0
  while (xor > 0n) {
    distance += Number(xor & 1n)
    xor >>= 1n
  }
  return distance
}

function binaryPhashToBigInt(binaryPhash: string): bigint {
  const normalized = binaryPhash.startsWith('0b') ? binaryPhash.slice(2) : binaryPhash
  return BigInt('0b' + normalized)
}

/**
 * Scanner pHash sub-module.
 *
 * This is intentionally handler-agnostic so it can be reused by other media
 * handlers, while still being owned and instantiated by ScannerService.
 */
export class ScannerPhash {
  private dbCache = new Map<string, PhashDbRecord[]>()

  clearDbCache(): void {
    this.dbCache.clear()
  }

  loadPhashDbRecords(selectSql: string): PhashDbRecord[] {
    const cacheKey = getCacheKey(selectSql)
    const cached = this.dbCache.get(cacheKey)
    if (cached) return cached

    let db: Database.Database | null = null
    try {
      db = new Database(PHASH_DB_PATH, { readonly: true, fileMustExist: true })
      const rows = db.prepare(selectSql).all() as PhashDbRow[]
      const records: PhashDbRecord[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        externalIds: parseExternalIds(row.external_ids),
        hash: BigInt('0x' + row.phash)
      }))
      this.dbCache.set(cacheKey, records)
      return records
    } catch {
      this.dbCache.set(cacheKey, [])
      return []
    } finally {
      db?.close()
    }
  }

  findBestPhashDbMatch(params: {
    inputPhashes: readonly string[]
    selectSql: string
    maxDistance?: number
  }): PhashDbMatch | null {
    const { inputPhashes, selectSql, maxDistance = 5 } = params
    if (inputPhashes.length === 0) return null

    const records = this.loadPhashDbRecords(selectSql)
    if (records.length === 0) return null

    let bestMatch: PhashDbMatch | null = null

    for (const inputPhash of inputPhashes) {
      let inputHash: bigint
      try {
        inputHash = binaryPhashToBigInt(inputPhash)
      } catch {
        continue
      }

      for (const record of records) {
        const distance = hammingDistance(inputHash, record.hash)
        if (distance === 0) {
          return { record, distance, inputPhash }
        }

        if (distance <= maxDistance && (!bestMatch || distance < bestMatch.distance)) {
          bestMatch = { record, distance, inputPhash }
        }
      }
    }

    return bestMatch
  }

  async findBestPhashDbMatchFromFiles(params: {
    filePaths: readonly string[]
    index: PhashIndexSpec
    maxDistance?: number
    fileIconSize?: FileIconSize
  }): Promise<{
    match: PhashDbMatch | null
    computed: FilePhashItem[]
    emptyPaths: string[]
    errors: Array<{ filePath: string; error: unknown }>
  }> {
    const {
      filePaths,
      index,
      maxDistance = index.defaultMaxDistance,
      fileIconSize = index.input.kind === 'file-icon' ? index.input.iconSize : 'large'
    } = params
    if (filePaths.length === 0) {
      return { match: null, computed: [], emptyPaths: [], errors: [] }
    }

    const records = this.loadPhashDbRecords(index.selectSql)
    if (records.length === 0) {
      return { match: null, computed: [], emptyPaths: [], errors: [] }
    }

    const computed: FilePhashItem[] = []
    const emptyPaths: string[] = []
    const errors: Array<{ filePath: string; error: unknown }> = []

    for (const filePath of filePaths) {
      try {
        let hash: string | null = null
        switch (index.input.kind) {
          case 'file-icon':
            hash = await this.computePhashFromFileIcon(filePath, { size: fileIconSize })
            break
          default:
            throw new Error(
              `Unsupported phash input kind: ${(index.input as { kind: string }).kind}`
            )
        }
        if (!hash) {
          emptyPaths.push(filePath)
          continue
        }
        computed.push({ filePath, phash: hash })
      } catch (error) {
        errors.push({ filePath, error })
      }
    }

    const inputPhashes = computed.map((item) => item.phash)
    const match =
      inputPhashes.length === 0
        ? null
        : this.findBestPhashDbMatch({
            inputPhashes,
            maxDistance,
            selectSql: index.selectSql
          })

    return { match, computed, emptyPaths, errors }
  }

  async computePhashFromPngBuffer(pngBuffer: Buffer): Promise<string> {
    return phash(pngBuffer)
  }

  async computePhashFromFileIcon(
    filePath: string,
    options: { size?: FileIconSize } = {}
  ): Promise<string | null> {
    const icon = await app.getFileIcon(filePath, { size: options.size ?? 'large' })
    if (icon.isEmpty()) return null
    return await this.computePhashFromPngBuffer(icon.toPNG())
  }
}
