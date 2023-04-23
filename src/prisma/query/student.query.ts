import { PrismaClient, student as StudentModel } from '@prisma/client'

import { parseUserToUserModel } from 'src/database/converter'
import { User } from 'src/types'

export class StudentQuery {
  constructor(private prismaUser: PrismaClient['student']) {}

  public async createUser(user: User): Promise<StudentModel> {
    const userModel = parseUserToUserModel(user)
    return this.prismaUser.create({
      data: userModel,
    })
  }

  public async getOne(email: string): Promise<StudentModel> {
    return this.prismaUser.findUnique({
      where: {
        username: email.toLowerCase(),
      },
    })
  }

  public async editUserPassword(email: string, password: string, salt: string): Promise<StudentModel> {
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
