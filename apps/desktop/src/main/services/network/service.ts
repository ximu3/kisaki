/**
 * Network Service
 *
 * Unified network layer for the main process with:
 * - Timeout and retry with exponential backoff
 * - Domain-based rate limiting (caller-registered)
 * - Plugin-accessible API
 */

import { net, session } from 'electron'
import log from 'electron-log/main'
import { createWriteStream } from 'node:fs'
import path from 'path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import fse from 'fs-extra'
import type { IService, ServiceInitContainer, ServiceName } from '@main/container'
import type { FetchOptions, RateLimitConfig } from '@shared/network'

export class NetworkService implements IService {
  readonly id = 'network'
  readonly deps = [] as const satisfies readonly ServiceName[]

  // Default values (code constants, not user-configurable)
  private readonly defaultTimeoutMs = 30000
  private readonly defaultRetryCount = 3

  // Domain-based rate limiters (caller-registered)
  private rateLimiters = new Map<string, RateLimiter>()

  // ===========================================================================
  // Lifecycle
  // ===========================================================================

  async init(_container: ServiceInitContainer<this>): Promise<void> {
    // Explicitly use system proxy. (This is also Electron's default behavior.)
    await session.defaultSession.setProxy({ mode: 'system' })

    log.info('[NetworkService] Initialized')
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Unified fetch with timeout, retry, and rate limiting.
   * Uses Electron's net.fetch which respects session proxy settings.
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const {
      timeout = this.defaultTimeoutMs,
      retries = this.defaultRetryCount,
      rateLimitKey,
      method = 'GET',
      headers,
      body
    } = options

    // Apply rate limiting if registered
    if (rateLimitKey) {
      const limiter = this.rateLimiters.get(rateLimitKey)
      if (limiter) {
        await limiter.wait()
      }
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body as BodyInit
    }

    // Execute with retry
    return this.executeWithRetry(() => this.fetchWithTimeout(url, fetchOptions, timeout), retries)
  }

  /**
   * Download content as Buffer
   */
  async downloadBuffer(url: string, options: FetchOptions = {}): Promise<Buffer> {
    const response = await this.fetch(url, options)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * Download content to a file via streaming (avoids buffering the full response in memory).
   */
  async downloadToFile(url: string, destPath: string, options: FetchOptions = {}): Promise<void> {
    const retries = options.retries ?? this.defaultRetryCount
    const attemptOptions: FetchOptions = { ...options, retries: 0 }

    await this.executeWithRetry(async () => {
      await fse.ensureDir(path.dirname(destPath))
      await fse.remove(destPath).catch(() => undefined)

      const response = await this.fetch(url, attemptOptions)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }
      if (!response.body) {
        throw new Error('Download failed: empty response body')
      }

      const bodyStream = Readable.fromWeb(response.body as any)
      const fileStream = createWriteStream(destPath)

      try {
        await pipeline(bodyStream, fileStream)
      } catch (error) {
        await fse.remove(destPath).catch(() => undefined)
        throw error
      }
    }, retries)
  }

  /**
   * Register a rate limiter for a domain key.
   * Callers are responsible for registering their own rate limit configurations.
   */
  registerRateLimit(key: string, config: RateLimitConfig): void {
    this.rateLimiters.set(key, new RateLimiter(config))
    log.debug(
      `[NetworkService] Registered rate limit for '${key}': ${config.maxRequests} requests per ${config.windowMs}ms`
    )
  }

  /**
   * Unregister a rate limiter
   */
  unregisterRateLimit(key: string): void {
    this.rateLimiters.delete(key)
  }

  /**
   * ===========================================================================
   * Private Helpers
   * ===========================================================================
   */

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await net.fetch(url, {
        ...options,
        signal: controller.signal
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // Don't retry on abort (timeout)
        if (lastError.name === 'AbortError') {
          throw new Error(`Request timeout: ${lastError.message}`)
        }

        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s, max 10s
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          log.warn(
            `[NetworkService] Retry ${attempt + 1}/${retries} after ${delay}ms: ${lastError.message}`
          )
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * Sliding window rate limiter with mutex
 *
 * Allows bursting up to maxRequests, then queues subsequent requests.
 * Uses a mutex to ensure only one request can acquire a slot at a time,
 * preventing the race condition where multiple waiters wake up simultaneously.
 */
class RateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private requestTimestamps: number[] = []
  private waitQueue: Array<() => void> = []
  private processing = false

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests
    this.windowMs = config.windowMs
  }

  async wait(): Promise<void> {
    // Queue if another request is being processed
    if (this.processing) {
      await new Promise<void>((resolve) => this.waitQueue.push(resolve))
    }

    this.processing = true

    try {
      await this.acquireSlot()
    } finally {
      this.processing = false
      // Wake up next waiter in queue
      const next = this.waitQueue.shift()
      if (next) next()
    }
  }

  private async acquireSlot(): Promise<void> {
    while (true) {
      const now = Date.now()
      const windowStart = now - this.windowMs

      // Clean up old timestamps
      this.requestTimestamps = this.requestTimestamps.filter((t) => t > windowStart)

      // If under limit, proceed
      if (this.requestTimestamps.length < this.maxRequests) {
        this.requestTimestamps.push(now)
        return
      }

      // At limit - wait until oldest request exits window
      const oldestTimestamp = this.requestTimestamps[0]
      const waitTime = oldestTimestamp + this.windowMs - now + 1 // +1ms buffer

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }

      // Loop back to re-check (in case timing drift)
    }
  }
}
