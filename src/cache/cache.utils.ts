import * as cacheManager from 'cache-manager'
import * as redisStore from 'cache-manager-redis-store'

import { CacheService } from 'src/cache/cache.service'
import { config } from 'src/config'

export const INJECT_CACHE = 'INJECT_CACHE'

export const getCacheFactory = (prefix: string) => ({
  provide: INJECT_CACHE,
  useFactory: async () => {
    return new CacheService(
      cacheManager.caching({
        store: redisStore,
        host: config().redis.host,
        port: config().redis.port,
        ttl: 0,
      }),
      prefix,
    )
  },
})
