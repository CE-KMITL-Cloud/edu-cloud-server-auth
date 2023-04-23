import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { getUserFromUserModel } from 'src/database/converter'
import { DuplicateDataException } from 'src/exception'
import { QueryHelper } from 'src/prisma/query-helper'
import { Role, User } from 'src/types'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private readonly query: QueryHelper) {}

  public async getByEmail(email: string): Promise<User | null> {
    try {
      const admin = await this.query.admin.getOne(email)
      if (admin !== null) {
        return getUserFromUserModel(admin)
      }

      const student = await this.query.student.getOne(email)
      if (student !== null) {
        return getUserFromUserModel(student)
      }

      const faculty = await this.query.faculty.getOne(email)
      if (faculty !== null) {
        return getUserFromUserModel(faculty)
      }

      return null
    } catch (error) {
      this.logger.error(`[UserService - getByEmail] ERROR:`, error)
      throw error
    }
  }

  public async checkExistingUser(email: string): Promise<boolean> {
    const result = await this.getUserAndRoleFromTable(email)
    return result !== null
  }

  public async createUser(
    name: string,
    email: string,
    role: Role,
    hashedPassword: string,
    salt: string,
  ): Promise<User> {
    const data: User = {
      password: hashedPassword,
      salt: salt,
      name: name,
      email: email,
      status: true,
      createTime: dayjs(),
      expireTime: dayjs().add(4, 'year'),
    }

    try {
      switch (role) {
        case 'admin': {
          return getUserFromUserModel(await this.query.admin.createUser(data))
        }
        case 'faculty': {
          return getUserFromUserModel(await this.query.faculty.createUser(data))
        }
        case 'student': {
          return getUserFromUserModel(await this.query.student.createUser(data))
        }
        default: {
          console.log('impossible')
        }
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // * Duplicate data
          throw new DuplicateDataException((error.meta?.target as string[]) ?? [])
        }
      }
      this.logger.error(`[UserService - createUser] ERROR:`, error)
      throw error
    }
  }

  // TODO: implement this
  public async changePassword(email: string, hashedPassword: string, salt: string): Promise<void> {
    this.query.student.editUserPassword(email, hashedPassword, salt)
  }

  public async getUserAndRoleFromTable(email: string): Promise<{ role: Role; user: User } | null> {
    try {
      const admin = await this.query.admin.getOne(email)
      if (admin !== null) {
        return { user: getUserFromUserModel(admin), role: 'admin' }
      }

      const student = await this.query.student.getOne(email)
      if (student !== null) {
        return { user: getUserFromUserModel(student), role: 'student' }
      }

      const faculty = await this.query.faculty.getOne(email)
      if (faculty !== null) {
        return { user: getUserFromUserModel(faculty), role: 'faculty' }
      }

      return null
    } catch (error) {
      this.logger.error(`[UserService - getUserAndRoleFromTable] ERROR:`, error)
      throw error
    }
  }
}
