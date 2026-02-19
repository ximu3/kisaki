/**
 * YMGal API Client
 *
 * Base URL: https://www.ymgal.games
 * Auth: OAuth2 client_credentials (public scope).
 *
 * References:
 * - https://www.ymgal.games/developer
 */

import type { NetworkService } from '@main/services/network'
import { normalizeYmgalId } from './format'
import type {
  YmgalApiResponse,
  YmgalCharacter,
  YmgalCharacterArchiveData,
  YmgalGameArchiveData,
  YmgalGameSearchListItem,
  YmgalOrganization,
  YmgalOrganizationArchiveData,
  YmgalOrgGameItem,
  YmgalPage,
  YmgalPerson,
  YmgalPersonArchiveData,
  YmgalTokenResponse
} from './types'

const RATE_LIMIT_KEY = 'ymgal'
// Docs explicitly ask developers to avoid concurrent bursts.
const RATE_LIMIT_CONFIG = { maxRequests: 2, windowMs: 1000 }

const PUBLIC_CLIENT_ID = 'ymgal'
const PUBLIC_CLIENT_SECRET = 'luna0327'
const TOKEN_SCOPE = 'public'

type QueryValue = string | number | boolean | null | undefined

export class YmgalApiError extends Error {
  constructor(
    public readonly code: number,
    message: string
  ) {
    super(message)
    this.name = 'YmgalApiError'
  }
}

export function isYmgalApiError(error: unknown): error is YmgalApiError {
  return error instanceof YmgalApiError
}

export class YmgalClient {
  private readonly baseUrl = 'https://www.ymgal.games'
  private rateLimitRegistered = false

  private accessToken: string | null = null
  private tokenExpiry = 0
  private tokenPromise: Promise<string> | null = null

  constructor(
    private readonly network: NetworkService,
    private readonly clientId?: string,
    private readonly clientSecret?: string
  ) {}

  private ensureRateLimitRegistered(): void {
    if (!this.rateLimitRegistered) {
      this.network.registerRateLimit(RATE_LIMIT_KEY, RATE_LIMIT_CONFIG)
      this.rateLimitRegistered = true
    }
  }

  private resolveClientId(): string {
    return this.clientId?.trim() || PUBLIC_CLIENT_ID
  }

  private resolveClientSecret(): string {
    return this.clientSecret?.trim() || PUBLIC_CLIENT_SECRET
  }

  private buildUrl(pathname: string, query?: Record<string, QueryValue>): string {
    const url = new URL(pathname, this.baseUrl)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue
        url.searchParams.set(key, String(value))
      }
    }

    return url.toString()
  }

  private buildApiHeaders(accessToken: string): Record<string, string> {
    return {
      Accept: 'application/json;charset=utf-8',
      Authorization: `Bearer ${accessToken}`,
      version: '1'
    }
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    this.ensureRateLimitRegistered()

    const now = Date.now()
    if (!forceRefresh && this.accessToken && this.tokenExpiry > now + 30_000) {
      return this.accessToken
    }

    if (!forceRefresh && this.tokenPromise) {
      return this.tokenPromise
    }

    this.tokenPromise = this.fetchAccessToken().finally(() => {
      this.tokenPromise = null
    })

    return this.tokenPromise
  }

  private async fetchAccessToken(): Promise<string> {
    const response = await this.network.fetch(
      this.buildUrl('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: this.resolveClientId(),
        client_secret: this.resolveClientSecret(),
        scope: TOKEN_SCOPE
      }),
      {
        method: 'GET',
        rateLimitKey: RATE_LIMIT_KEY
      }
    )

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `YMGal OAuth failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`
      )
    }

    const tokenResponse = (await response.json()) as YmgalTokenResponse
    const accessToken = tokenResponse.access_token?.trim()
    if (!accessToken) {
      throw new Error('YMGal OAuth failed: missing access_token.')
    }

    const expiresIn = Number(tokenResponse.expires_in)
    const expiresMs = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn * 1000 : 3_600_000

    this.accessToken = accessToken
    this.tokenExpiry = Date.now() + expiresMs
    return accessToken
  }

  private async requestData<T>(
    pathname: string,
    query?: Record<string, QueryValue>,
    retryOnUnauthorized = true
  ): Promise<T> {
    this.ensureRateLimitRegistered()
    const token = await this.getAccessToken()

    const response = await this.network.fetch(this.buildUrl(pathname, query), {
      method: 'GET',
      headers: this.buildApiHeaders(token),
      rateLimitKey: RATE_LIMIT_KEY
    })

    if (response.status === 401 && retryOnUnauthorized) {
      this.accessToken = null
      this.tokenExpiry = 0
      await this.getAccessToken(true)
      return this.requestData<T>(pathname, query, false)
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(
        `YMGal API request failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`
      )
    }

    const payload = (await response.json()) as YmgalApiResponse<T>
    const code = Number(payload.code)

    if (!payload.success || code !== 0) {
      throw new YmgalApiError(code, payload.msg?.trim() || `YMGal API error: code ${code}`)
    }

    if (payload.data === undefined || payload.data === null) {
      throw new YmgalApiError(code, 'YMGal API returned empty data.')
    }

    return payload.data
  }

  async searchGameList(
    keyword: string,
    pageNum = 1,
    pageSize = 20
  ): Promise<YmgalPage<YmgalGameSearchListItem>> {
    const normalizedKeyword = keyword.trim()
    if (!normalizedKeyword) {
      return { result: [], total: 0, hasNext: false, pageNum: 1, pageSize: 20 }
    }

    return this.requestData<YmgalPage<YmgalGameSearchListItem>>('/open/archive/search-game', {
      mode: 'list',
      keyword: normalizedKeyword,
      pageNum: Math.max(1, Math.floor(pageNum)),
      pageSize: Math.max(1, Math.min(Math.floor(pageSize), 20))
    })
  }

  async searchGameAccurate(keyword: string, similarity = 70): Promise<YmgalGameArchiveData | null> {
    const normalizedKeyword = keyword.trim()
    if (!normalizedKeyword) return null

    try {
      return await this.requestData<YmgalGameArchiveData>('/open/archive/search-game', {
        mode: 'accurate',
        keyword: normalizedKeyword,
        similarity: Math.max(50, Math.min(Math.floor(similarity), 99))
      })
    } catch (error) {
      if (isYmgalApiError(error) && (error.code === 404 || error.code === 614)) {
        return null
      }
      throw error
    }
  }

  async getGameArchive(gameId: string): Promise<YmgalGameArchiveData> {
    return this.requestData<YmgalGameArchiveData>('/open/archive', {
      gid: normalizeYmgalId(gameId, 'YMGal game id')
    })
  }

  async getOrganizationArchive(orgId: string): Promise<YmgalOrganization> {
    const data = await this.requestData<YmgalOrganizationArchiveData>('/open/archive', {
      orgId: normalizeYmgalId(orgId, 'YMGal organization id')
    })
    if (!data.org) {
      throw new Error(`YMGal organization not found: ${orgId}`)
    }
    return data.org
  }

  async getCharacterArchive(characterId: string): Promise<YmgalCharacter> {
    const data = await this.requestData<YmgalCharacterArchiveData>('/open/archive', {
      cid: normalizeYmgalId(characterId, 'YMGal character id')
    })
    if (!data.character) {
      throw new Error(`YMGal character not found: ${characterId}`)
    }
    return data.character
  }

  async getPersonArchive(personId: string): Promise<YmgalPerson> {
    const data = await this.requestData<YmgalPersonArchiveData>('/open/archive', {
      pid: normalizeYmgalId(personId, 'YMGal person id')
    })
    if (!data.person) {
      throw new Error(`YMGal person not found: ${personId}`)
    }
    return data.person
  }

  async getOrganizationGames(orgId: string): Promise<YmgalOrgGameItem[]> {
    return this.requestData<YmgalOrgGameItem[]>('/open/archive/game', {
      orgId: normalizeYmgalId(orgId, 'YMGal organization id')
    })
  }

  async getGamesByReleaseDateRange(
    releaseStartDate: string,
    releaseEndDate: string
  ): Promise<YmgalOrgGameItem[]> {
    return this.requestData<YmgalOrgGameItem[]>('/open/archive/game', {
      releaseStartDate: releaseStartDate.trim(),
      releaseEndDate: releaseEndDate.trim()
    })
  }

  async getRandomGames(num = 5): Promise<YmgalOrgGameItem[]> {
    return this.requestData<YmgalOrgGameItem[]>('/open/archive/random-game', {
      num: Math.max(1, Math.min(Math.floor(num), 10))
    })
  }
}
