import { faculty as FacultyModel, PrismaClient } from '@prisma/client'

import { parseUserToUserModel } from 'src/database/converter'
import { User } from 'src/types'

export class FacultyQuery {
  constructor(private prismaUser: PrismaClient['faculty']) {}

  public async createUser(user: User): Promise<FacultyModel> {
    const userModel = parseUserToUserModel(user)
    return this.prismaUser.create({
      data: userModel,
    })
  }

  public async getOne(email: string): Promise<FacultyModel> {
    return this.prismaUser.findUnique({
      where: {
        username: email.toLowerCase(),
      },
    })
  }

  public async editUserPassword(email: string, password: string, salt: string): Promise<FacultyModel> {
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
