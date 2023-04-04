import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { getHashedPassword } from 'src/utils/getHash'

import { CacheService } from 'src/cache/cache.service'
import { INJECT_CACHE } from 'src/cache/cache.utils'
import { JwtPayload, JwtResult, User } from 'src/types'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    @Inject(INJECT_CACHE) private readonly cacheService: CacheService,
  ) {}

  // TODO: Use real hashedPassword
  public async validate(user: User, password: string): Promise<boolean> {
    const hashedPassword = getHashedPassword(password, user.salt)

    if (hashedPassword === user.password) {
      return true
    }

    this.logger.error('[AuthService - validateUser] Invalid Password', {
      email: user.email,
    })

    return false
  }

  public async login(user: User): Promise<JwtResult> {
    const payload: JwtPayload = { email: user.email, name: user.name }

    const accessToken = this.getAccessToken(payload)
    const refreshToken = this.getRefreshToken(payload)

    await this.cacheService.set(refreshToken, accessToken)

    return { accessToken, refreshToken, tokenType: 'Bearer' }
  }

  public async refresh(user: User, oldRefreshToken: string): Promise<JwtResult> {
    const payload: JwtPayload = { email: user.email, name: user.name }

    const accessToken = this.getAccessToken(payload)
    const refreshToken = this.getRefreshToken(payload)

    await this.cacheService.del(oldRefreshToken)

    await this.cacheService.set(refreshToken, accessToken)

    return { accessToken, refreshToken, tokenType: 'Bearer' }
  }

  public getAccessToken(payload: any) {
    return this.jwtService.sign(payload)
  }

  public getRefreshToken(payload: any) {
    return this.jwtService.sign({ ...payload, isRefreshToken: true }, { expiresIn: 60 * 60 * 24 })
  }

  public async validateRefreshToken(token: string): Promise<{ name: string; email: string } | null> {
    try {
      const decoded = await this.jwtService.verifyAsync(token)

      if (!decoded.isRefreshToken) {
        this.logger.error('[AuthService - validateRefreshToken] Wrong token type', { refreshToken: token })
        return null
      }

      return decoded
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        this.logger.error('[AuthService - validateRefreshToken] TokenExpiredError', { ...err, refreshToken: token })
        return null
      } else {
        this.logger.error('[AuthService - validateRefreshToken] Error', err)
        return null
      }
    }
  }
}
