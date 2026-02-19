/**
 * Bangumi API Client
 *
 * HTTP client for Bangumi v0 API.
 *
 * References:
 * - https://bangumi.github.io/api/
 * - https://bangumi.github.io/api/dist.json
 * - https://github.com/bangumi/api/
 */

import type { NetworkService } from '@main/services/network'
import type {
  BangumiCharacterDetail,
  BangumiCharacterPerson,
  BangumiEntityImageType,
  BangumiImageType,
  BangumiPaged,
  BangumiRelatedCharacter,
  BangumiRelatedPerson,
  BangumiSearchSubjectPayload,
  BangumiSubject,
  BangumiSubjectRelation,
  BangumiPersonDetail
} from './types'

const RATE_LIMIT_KEY = 'bangumi'
// No official public rate limit in docs. Keep a conservative limit.
const RATE_LIMIT_CONFIG = { maxRequests: 4, windowMs: 1000 }

export class BangumiClient {
  private readonly baseUrl = 'https://api.bgm.tv'
  private readonly userAgent = 'ximu3/Kisaki/1.0.0 (https://github.com/ximu3/kisaki)'
  private rateLimitRegistered = false

  constructor(
    private readonly network: NetworkService,
    private readonly accessToken?: string
  ) {}

  private ensureRateLimitRegistered(): void {
    if (!this.rateLimitRegistered) {
      this.network.registerRateLimit(RATE_LIMIT_KEY, RATE_LIMIT_CONFIG)
      this.rateLimitRegistered = true
    }
  }

  private buildUrl(pathname: string, query?: Record<string, string | number | boolean>): string {
    const url = new URL(pathname, this.baseUrl)
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue
        url.searchParams.set(key, String(value))
      }
    }
    return url.toString()
  }

  private buildHeaders(method: 'GET' | 'POST'): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': this.userAgent
    }

    if (method === 'POST') {
      headers['Content-Type'] = 'application/json'
    }

    if (this.accessToken?.trim()) {
      headers.Authorization = `Bearer ${this.accessToken.trim()}`
    }

    return headers
  }

  private async request<T>(
    method: 'GET' | 'POST',
    pathname: string,
    query?: Record<string, string | number | boolean>,
    body?: unknown
  ): Promise<T> {
    this.ensureRateLimitRegistered()

    const response = await this.network.fetch(this.buildUrl(pathname, query), {
      method,
      headers: this.buildHeaders(method),
      body: body ? JSON.stringify(body) : undefined,
      rateLimitKey: RATE_LIMIT_KEY
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `Bangumi API request failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`
      )
    }

    return response.json() as Promise<T>
  }

  private async requestRedirectUrl(
    pathname: string,
    query: Record<string, string | number | boolean>
  ): Promise<string | undefined> {
    this.ensureRateLimitRegistered()

    const response = await this.network.fetch(this.buildUrl(pathname, query), {
      method: 'GET',
      headers: this.buildHeaders('GET'),
      rateLimitKey: RATE_LIMIT_KEY
    })

    if (!response.ok) {
      return undefined
    }

    return response.url?.trim() || undefined
  }

  async searchSubjects(
    payload: BangumiSearchSubjectPayload,
    limit = 25,
    offset = 0
  ): Promise<BangumiPaged<BangumiSubject>> {
    return this.request<BangumiPaged<BangumiSubject>>(
      'POST',
      '/v0/search/subjects',
      { limit, offset },
      payload
    )
  }

  async getSubjectById(subjectId: number): Promise<BangumiSubject> {
    return this.request<BangumiSubject>('GET', `/v0/subjects/${subjectId}`)
  }

  async getSubjectPersons(subjectId: number): Promise<BangumiRelatedPerson[]> {
    return this.request<BangumiRelatedPerson[]>('GET', `/v0/subjects/${subjectId}/persons`)
  }

  async getSubjectCharacters(subjectId: number): Promise<BangumiRelatedCharacter[]> {
    return this.request<BangumiRelatedCharacter[]>('GET', `/v0/subjects/${subjectId}/characters`)
  }

  async getSubjectRelations(subjectId: number): Promise<BangumiSubjectRelation[]> {
    return this.request<BangumiSubjectRelation[]>('GET', `/v0/subjects/${subjectId}/subjects`)
  }

  async getCharacterById(characterId: number): Promise<BangumiCharacterDetail> {
    return this.request<BangumiCharacterDetail>('GET', `/v0/characters/${characterId}`)
  }

  async getCharacterPersons(characterId: number): Promise<BangumiCharacterPerson[]> {
    return this.request<BangumiCharacterPerson[]>('GET', `/v0/characters/${characterId}/persons`)
  }

  async getPersonById(personId: number): Promise<BangumiPersonDetail> {
    return this.request<BangumiPersonDetail>('GET', `/v0/persons/${personId}`)
  }

  async getSubjectImageUrl(subjectId: number, type: BangumiImageType): Promise<string | undefined> {
    return this.requestRedirectUrl(`/v0/subjects/${subjectId}/image`, { type })
  }

  async getCharacterImageUrl(
    characterId: number,
    type: BangumiEntityImageType
  ): Promise<string | undefined> {
    return this.requestRedirectUrl(`/v0/characters/${characterId}/image`, { type })
  }

  async getPersonImageUrl(
    personId: number,
    type: BangumiEntityImageType
  ): Promise<string | undefined> {
    return this.requestRedirectUrl(`/v0/persons/${personId}/image`, { type })
  }
}
