import {
  admin as AdminModel,
  faculty as FacultyModel,
  instance_limit as InstanceLimitModel,
  Prisma,
  student as StudentModel,
} from '@prisma/client'
import dayjs from 'dayjs'

import { InstanceLimitConfig, User } from 'src/types'

type UserModel = AdminModel | StudentModel | FacultyModel

export const getUserFromUserModel = (userModel: UserModel): User => {
  return {
    email: userModel.username,
    name: userModel.name,
    password: userModel.password,
    salt: userModel.salt,
    status: userModel.status,
    createTime: dayjs(userModel.create_time),
    expireTime: dayjs(userModel.expire_time),
  }
}

export const parseUserToUserModel = (user: User): UserModel => {
  return {
    username: user.email,
    name: user.name,
    password: user.password,
    salt: user.salt,
    status: user.status,
    create_time: user.createTime.unix().toFixed(),
    expire_time: user.expireTime.unix().toFixed(),
  }
}

export const parseInstanceLimitConfigToInstanceLimitModel = (
  email: string,
  config: InstanceLimitConfig,
): InstanceLimitModel => {
  return {
    max_cpu: new Prisma.Decimal(config.maxCPU),
    max_disk: new Prisma.Decimal(config.maxDisk),
    max_instance: BigInt(config.maxInstance),
    max_ram: new Prisma.Decimal(config.maxRAM),
    username: email,
  }
}
