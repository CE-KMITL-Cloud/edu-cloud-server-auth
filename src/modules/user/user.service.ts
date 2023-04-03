import { Inject, Injectable, Logger } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'

import { CreateUserDTO } from './user.dto'

import { CacheService } from 'src/cache/cache.service'
import { INJECT_CACHE } from 'src/cache/cache.utils'
import { User } from 'src/types'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(@Inject(INJECT_CACHE) private cacheService: CacheService) {}

  private readonly users: User[] = [
    {
      id: '1',
      name: 'a',
      username: 'aaaaaaaa',
      email: 'a@gmail.com',
      password: 'jeskbges',
      salt: 'weighiewlsgn',
    },
    {
      id: '2',
      name: 'b',
      username: 'bbbbbbbb',
      email: 'b@gmail.com',
      password: 'wealghwlieg',
      salt: 'zknknirnh',
    },
    {
      id: '3',
      name: 'c',
      username: 'cccccccc',
      email: 'c@gmail.com',
      password: 'lmjomqd',
      salt: 'ljbugyfywwwuksgb',
    },
    {
      id: '4',
      name: 'd',
      username: 'dddddddd',
      email: 'd@gmail.com',
      password: 'dsafbkaevfyufฟก',
      salt: 'vjzoozoeufbseufb',
    },
  ]

  public async getByUsername(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username)
  }

  public async getByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email)
  }

  public async checkExistingUser(email: string, username: string): Promise<boolean> {
    return this.getByUsername(username) !== undefined || this.getByEmail(email) !== undefined
  }

  public async createUser(createUserDTO: CreateUserDTO, hashedPassword: string, salt: string): Promise<User> {
    return {
      id: uuidv4(),
      name: createUserDTO.username,
      username: createUserDTO.username,
      email: createUserDTO.email,
      password: hashedPassword,
      salt: salt,
    }
  }

  public async changePassword(username: string, hashedPassword: string, salt: string): Promise<void> {
    const index = this.users.findIndex((user) => user.username === username)
    this.users[index].password = hashedPassword
    this.users[index].salt = salt
  }

  public async validateResetPasswordOtp(username: string, otp: string): Promise<boolean> {
    try {
      const cacheKey = this.getUserForgotPasswordOtpCacheKey(username)
      const otpFromCache = await this.cacheService.get<string>(cacheKey)

      if (!!otpFromCache && otpFromCache === otp) {
        await this.cacheService.del(cacheKey)
        return true
      } else {
        return false
      }
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  private getUserForgotPasswordOtpCacheKey = (username: string) => `${username}-forgot-password-otp`.toLowerCase()
}
