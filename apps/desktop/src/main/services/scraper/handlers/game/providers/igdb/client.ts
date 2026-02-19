/**
 * IGDB API Client
 *
 * Base URL: https://api.igdb.com/v4
 * Auth: Twitch OAuth Client Credentials + Client-ID header
 *
 * Docs:
 * - https://api-docs.igdb.com/
 * - https://igdb-openapi.s-crypt.co/IGDB-OpenAPI.yaml
 */

import type { NetworkService } from '@main/services/network'
import { clampLimit } from './format'
import type { IgdbTokenResponse } from './types'

const RATE_LIMIT_KEY = 'igdb'
// Official docs: 4 requests per second.
const RATE_LIMIT_CONFIG = { maxRequests: 4, windowMs: 1000 }
// Official docs: at most 8 open requests.
const MAX_CONCURRENT_REQUESTS = 8

export class IgdbClient {
  private readonly baseUrl = 'https://api.igdb.com/v4'
  private readonly oauthUrl = 'https://id.twitch.tv/oauth2/token'
  private readonly userAgent = 'kisaki/1.0'

  private accessToken: string | null = null
  private tokenExpiry = 0
  private rateLimitRegistered = false

  private activeRequests = 0
  private waitQueue: Array<() => void> = []

  constructor(
    private readonly network: NetworkService,
    private readonly clientId?: string,
    private readonly clientSecret?: string
  ) {}

  isConfigured(): boolean {
    return !!this.clientId?.trim() && !!this.clientSecret?.trim()
  }

  private ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new Error(
        'IGDB credentials are missing. Set VITE_IGDB_API_CLIENT_ID and VITE_IGDB_API_CLIENT_SECRET.'
      )
    }
  }

  private ensureRateLimitRegistered(): void {
    if (!this.rateLimitRegistered) {
      this.network.registerRateLimit(RATE_LIMIT_KEY, RATE_LIMIT_CONFIG)
      this.rateLimitRegistered = true
    }
  }

  private async withConcurrencyLimit<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= MAX_CONCURRENT_REQUESTS) {
      await new Promise<void>((resolve) => this.waitQueue.push(resolve))
    }

    this.activeRequests += 1
    try {
      return await task()
    } finally {
      this.activeRequests -= 1
      const next = this.waitQueue.shift()
      if (next) next()
    }
  }

  private async getAccessToken(): Promise<string> {
    this.ensureConfigured()
    const now = Date.now()

    if (this.accessToken && this.tokenExpiry > now + 60_000) {
      return this.accessToken
    }

    this.ensureRateLimitRegistered()

    const clientId = encodeURIComponent(this.clientId!.trim())
    const clientSecret = encodeURIComponent(this.clientSecret!.trim())
    const url = `${this.oauthUrl}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`

    const response = await this.withConcurrencyLimit(() =>
      this.network.fetch(url, {
        method: 'POST',
        rateLimitKey: RATE_LIMIT_KEY
      })
    )

    if (!response.ok) {
      throw new Error(`IGDB OAuth failed: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as IgdbTokenResponse
    this.accessToken = data.access_token
    this.tokenExpiry = now + data.expires_in * 1000
    return data.access_token
  }

  private async request<T>(endpoint: string, body: string): Promise<T[]> {
    this.ensureConfigured()
    this.ensureRateLimitRegistered()

    const execute = async (retryOnUnauthorized: boolean): Promise<T[]> => {
      const token = await this.getAccessToken()
      const response = await this.withConcurrencyLimit(() =>
        this.network.fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'text/plain',
            'Client-ID': this.clientId!.trim(),
            Authorization: `Bearer ${token}`,
            'User-Agent': this.userAgent
          },
          body,
          rateLimitKey: RATE_LIMIT_KEY
        })
      )

      if (response.status === 401 && retryOnUnauthorized) {
        this.accessToken = null
        this.tokenExpiry = 0
        return execute(false)
      }

      if (!response.ok) {
        let detail = ''
        try {
          detail = await response.text()
        } catch {
          detail = ''
        }
        throw new Error(
          `IGDB API request failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`
        )
      }

      return response.json() as Promise<T[]>
    }

    return execute(true)
  }

  async query<T>(endpoint: string, body: string): Promise<T[]> {
    return this.request<T>(endpoint, body)
  }

  async queryByIds<T>(endpoint: string, ids: number[], fields: string): Promise<T[]> {
    const uniqueIds = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))]
    if (uniqueIds.length === 0) return []

    const chunkSize = 200
    const all: T[] = []

    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
      const chunk = uniqueIds.slice(i, i + chunkSize)
      const body = `fields ${fields}; where id = (${chunk.join(',')}); limit ${clampLimit(chunk.length)};`
      const data = await this.request<T>(endpoint, body)
      all.push(...data)
    }

    return all
  }
}
