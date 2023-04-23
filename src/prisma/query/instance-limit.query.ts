import { instance_limit as InstanceLimitModel, PrismaClient } from '@prisma/client'

import { parseInstanceLimitConfigToInstanceLimitModel } from 'src/database/converter'
import { InstanceLimitConfig } from 'src/types'

export class InstanceLimitQuery {
  constructor(private prismaInstanceLimit: PrismaClient['instance_limit']) {}

  public async createInstanceLimit(email: string, config: InstanceLimitConfig): Promise<InstanceLimitModel> {
    const instanceLimitModel = parseInstanceLimitConfigToInstanceLimitModel(email, config)
    return this.prismaInstanceLimit.create({
      data: instanceLimitModel,
    })
  }
}
