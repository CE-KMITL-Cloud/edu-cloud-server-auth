import { Module } from '@nestjs/common'

import { UserService } from './user.service'

import { getCacheFactory } from 'src/cache/cache.utils'

const cacheFactory = getCacheFactory('user')

@Module({
  providers: [UserService, cacheFactory],
  exports: [UserService],
})
export class UserModule {}
