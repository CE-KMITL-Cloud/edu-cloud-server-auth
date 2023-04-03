import { Logger } from '@nestjs/common'

import { Config } from './config'

export const config = (): Config => {
  const logger = new Logger('Config')

  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Loading env from .env.${process.env.ENV_NAME ?? 'development'}`)
  }

  const config: Config = {
    port: parseInt(process.env.PORT || '5000'),
    jwtSecret: process.env.JWT_SECRET || 'cepp',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: parseInt(process.env.REDIS_TTL || '86400'),
    },
    postgres: {
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || '',
      password: process.env.POSTGRES_PASSWORD || '',
      db: process.env.POSTGRES_DATABASE || '',
    },
  }

  return config
}
