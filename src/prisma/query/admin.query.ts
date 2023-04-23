import { admin as AdminModel, PrismaClient } from '@prisma/client'

import { parseUserToUserModel } from 'src/database/converter'
import { User } from 'src/types'

export class AdminQuery {
  constructor(private prismaUser: PrismaClient['admin']) {}

  public async createUser(user: User): Promise<AdminModel> {
    const userModel = parseUserToUserModel(user)
    return this.prismaUser.create({
      data: userModel,
    })
  }

  public async getOne(email: string): Promise<AdminModel> {
    return this.prismaUser.findUnique({
      where: {
        username: email.toLowerCase(),
      },
    })
  }

  public async editUserPassword(email: string, password: string, salt: string): Promise<AdminModel> {
    return this.prismaUser.update({
      where: {
        username: email.toLowerCase(),
      },
      data: {
        password: password,
        salt: salt,
      },
    })
  }
}
