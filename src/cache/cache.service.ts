import { Injectable } from '@nestjs/common'
import { Cache, CachingConfig } from 'cache-manager'

import { CacheOption } from 'src/types'

@Injectable()
export class CacheService {
  constructor(protected cacheManager: Cache, protected prefix: string) {}

  public async get<T>(key: string, options: CacheOption = {}): Promise<T | null> {
    const fullKey = options.disablePrefix ? key : `${this.prefix}-${key}`
    const value = await this.cacheManager.get(fullKey)

    if (!value) {
      return null
    }
    return JSON.parse(value as any)
  }

  public async set<T>(key: string, value: T, options: CacheOption = {}, config?: CachingConfig) {
    const fullKey = options.disablePrefix ? key : `${this.prefix}-${key}`
    await this.cacheManager.set(fullKey, JSON.stringify(value), config)
  }

  public async del(key: string, options: CacheOption = {}) {
    const fullKey = options.disablePrefix ? key : `${this.prefix}-${key}`

    await this.cacheManager.del(fullKey)
  }

  public async getOrFetch<T>(
    key: string,
    options: CacheOption = {},
    fetch: () => Promise<T>,
    config?: CachingConfig,
  ): Promise<T> {
    const result = await this.get<T>(key, options)

    if (result) {
      return result
    }

    const newResult = await fetch()

    await this.set(key, newResult, options, config)

    return newResult
  }
}
