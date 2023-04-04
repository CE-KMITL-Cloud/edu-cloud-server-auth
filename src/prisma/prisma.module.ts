import { Global, Module } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'
import { QueryHelper } from 'src/prisma/query-helper'

@Global()
@Module({
  providers: [PrismaService, QueryHelper],
  exports: [PrismaService, QueryHelper],
})
export class PrismaModule {}
