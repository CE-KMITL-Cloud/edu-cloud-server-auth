import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

// import { v4 as uuidv4 } from 'uuid'
// import { CreateUserDTO } from './user.dto'
// import { CacheService } from 'src/cache/cache.service'
// import { INJECT_CACHE } from 'src/cache/cache.utils'
import { getUserFromUserModel } from 'src/database/converter'
import { DuplicateDataException } from 'src/exception'
import { PrismaService } from 'src/prisma/prisma.service'
import { QueryHelper } from 'src/prisma/query-helper'
import { User } from 'src/types'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private readonly prisma: PrismaService, private readonly query: QueryHelper) {}

  public async getByEmail(email: string): Promise<User | undefined> {
    const student = await this.prisma.student.findUnique({
      where: {
        username: email.toLowerCase(),
      },
    })

    return getUserFromUserModel(student)
  }

  public async checkExistingUser(email: string): Promise<boolean> {
    const count = await this.prisma.student.count({
      where: {
        username: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })

    return count > 0
  }

  public async createUser(name: string, email: string, hashedPassword: string, salt: string): Promise<User> {
    try {
      const user = await this.query.student.createUser({
        password: hashedPassword,
        salt: salt,
        name: name,
        email: email,
        status: true,
        createTime: dayjs(),
        expireTime: dayjs().add(4, 'year'),
      })

      return getUserFromUserModel(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // * Duplicate data
          throw new DuplicateDataException((error.meta?.target as string[]) ?? [])
        }
      }
      this.logger.error(`[ArtistService - createArtist] ERROR:`, error)
      throw error
    }
  }

  public async changePassword(email: string, hashedPassword: string, salt: string): Promise<void> {
    this.query.student.editUserPassword(email, hashedPassword, salt)
  }
}
