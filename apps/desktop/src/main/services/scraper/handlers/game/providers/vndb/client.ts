/**
 * VNDB Kana API Client
 *
 * Base URL: https://api.vndb.org/kana
 *
 * References:
 * - https://api.vndb.org/kana
 * - https://api.vndb.org/kana/schema
 */

import type { NetworkService } from '@main/services/network'
import { buildIdOrFilter, chunkArray } from './format'
import type {
  VndbKanaSchema,
  VndbQueryRequest,
  VndbQueryResponse,
  VndbErrorResponse,
  VndbVn,
  VndbCharacter,
  VndbStaff,
  VndbProducer,
  VndbTag,
  VndbTrait,
  VndbRelease
} from './types'

const RATE_LIMIT_KEY = 'vndb'
// Official docs: 200 requests per 5 minutes (unauthenticated).
const RATE_LIMIT_CONFIG = { maxRequests: 200, windowMs: 300_000 }

type VndbEndpoint = 'vn' | 'release' | 'producer' | 'character' | 'staff' | 'tag' | 'trait'

export class VndbClient {
  private readonly baseUrl = 'https://api.vndb.org/kana'
  private readonly userAgent = 'kisaki/1.0 (+https://github.com/ximu3/kisaki)'
  private readonly token?: string

  private rateLimitRegistered = false
  private schemaPromise: Promise<VndbKanaSchema> | null = null

  constructor(
    private readonly network: NetworkService,
    token?: string
  ) {
    this.token = token?.trim() || undefined
  }

  private ensureRateLimitRegistered(): void {
    if (!this.rateLimitRegistered) {
      this.network.registerRateLimit(RATE_LIMIT_KEY, RATE_LIMIT_CONFIG)
      this.rateLimitRegistered = true
    }
  }

  private buildHeaders(method: 'GET' | 'POST'): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': this.userAgent
    }

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers.Authorization = `token ${this.token}`
    }

    return headers
  }

  private async request<T>(method: 'GET' | 'POST', pathname: string, body?: unknown): Promise<T> {
    this.ensureRateLimitRegistered()

    const response = await this.network.fetch(`${this.baseUrl}${pathname}`, {
      method,
      headers: this.buildHeaders(method),
      body: body ? JSON.stringify(body) : undefined,
      rateLimitKey: RATE_LIMIT_KEY
    })

    if (!response.ok) {
      let detail = ''

      try {
        const errorBody = (await response.json()) as Partial<VndbErrorResponse>
        if (errorBody.id && errorBody.message) {
          detail = `${errorBody.id}: ${errorBody.message}`
        } else {
          detail = JSON.stringify(errorBody)
        }
      } catch {
        detail = await response.text().catch(() => '')
      }

      throw new Error(
        `VNDB API request failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`
      )
    }

    return response.json() as Promise<T>
  }

  private async query<T>(
    endpoint: VndbEndpoint,
    body: VndbQueryRequest
  ): Promise<VndbQueryResponse<T>> {
    return this.request<VndbQueryResponse<T>>('POST', `/${endpoint}`, body)
  }

  private async queryAll<T>(
    endpoint: VndbEndpoint,
    body: VndbQueryRequest,
    maxPages = 10
  ): Promise<T[]> {
    const all: T[] = []
    const pageSize = Math.max(1, Math.min(Math.floor(body.results ?? 100), 100))
    let page = Math.max(1, Math.floor(body.page ?? 1))

    for (let i = 0; i < maxPages; i += 1) {
      const response = await this.query<T>(endpoint, {
        ...body,
        results: pageSize,
        page
      })

      all.push(...(response.results ?? []))
      if (!response.more) {
        break
      }

      page += 1
    }

    return all
  }

  private async queryByIds<T>(
    endpoint: VndbEndpoint,
    ids: string[],
    fields: string,
    chunkSize = 80
  ): Promise<T[]> {
    const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))]
    if (uniqueIds.length === 0) {
      return []
    }

    const all: T[] = []
    const chunks = chunkArray(uniqueIds, chunkSize)

    for (const chunk of chunks) {
      const rows = await this.queryAll<T>(
        endpoint,
        {
          filters: buildIdOrFilter(chunk),
          fields,
          sort: 'id',
          results: 100
        },
        5
      )
      all.push(...rows)
    }

    return all
  }

  async getSchema(): Promise<VndbKanaSchema> {
    if (!this.schemaPromise) {
      this.schemaPromise = this.request<VndbKanaSchema>('GET', '/schema')
    }
    return this.schemaPromise
  }

  async searchVn(query: string, fields: string, limit = 25): Promise<VndbVn[]> {
    const keyword = query.trim()
    if (!keyword) return []

    const response = await this.query<VndbVn>('vn', {
      filters: ['search', '=', keyword],
      fields,
      sort: 'searchrank',
      results: Math.max(1, Math.min(Math.floor(limit), 100))
    })

    return response.results ?? []
  }

  async getVnById(vnId: string, fields: string): Promise<VndbVn | null> {
    const response = await this.query<VndbVn>('vn', {
      filters: ['id', '=', vnId],
      fields,
      results: 1
    })
    return response.results?.[0] ?? null
  }

  async getCharactersByVn(vnId: string, fields: string): Promise<VndbCharacter[]> {
    return this.queryAll<VndbCharacter>(
      'character',
      {
        filters: ['vn', '=', ['id', '=', vnId]],
        fields,
        sort: 'id',
        results: 100
      },
      10
    )
  }

  async getReleasesByVn(vnId: string, fields: string): Promise<VndbRelease[]> {
    return this.queryAll<VndbRelease>(
      'release',
      {
        filters: ['vn', '=', ['id', '=', vnId]],
        fields,
        sort: 'id',
        results: 100
      },
      10
    )
  }

  async getStaffByIds(ids: string[], fields: string): Promise<VndbStaff[]> {
    return this.queryByIds<VndbStaff>('staff', ids, fields)
  }

  async getProducersByIds(ids: string[], fields: string): Promise<VndbProducer[]> {
    return this.queryByIds<VndbProducer>('producer', ids, fields)
  }

  async getTagsByIds(ids: string[], fields: string): Promise<VndbTag[]> {
    return this.queryByIds<VndbTag>('tag', ids, fields)
  }

  async getTraitsByIds(ids: string[], fields: string): Promise<VndbTrait[]> {
    return this.queryByIds<VndbTrait>('trait', ids, fields)
  }
}
