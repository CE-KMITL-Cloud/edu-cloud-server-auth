import { Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { getHashedPassword } from 'src/utils/getHash'

import { ValidateResult } from './auth.interface'

import { CacheService } from 'src/cache/cache.service'
import { INJECT_CACHE } from 'src/cache/cache.utils'
import { ProxmoxService } from 'src/modules/proxmox/proxmox.service'
import { AccessTicketCookie, JwtPayload, JwtResult, Role, User } from 'src/types'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly proxmoxService: ProxmoxService,

    @Inject(INJECT_CACHE) private readonly cacheService: CacheService,
  ) {}

  /**
   *
   * @param user
   * @param password
   * @returns hashedPassword if true else false
   */
  public async validate(user: User, password: string): Promise<ValidateResult> {
    const hashedPassword = getHashedPassword(password, user.salt)

    if (hashedPassword === user.password) {
      return {
        success: true,
        data: hashedPassword,
      }
    }

    this.logger.error('[AuthService - validateUser] Invalid Password', {
      email: user.email,
    })

    return {
      success: false,
    }
  }

  public async login(user: User, role: Role): Promise<JwtResult> {
    const payload: JwtPayload = { email: user.email, name: user.name, role: role }

    const accessToken = this.getAccessToken(payload)
    const refreshToken = this.getRefreshToken(payload)

    await this.cacheService.set(refreshToken, accessToken)

    return { accessToken, refreshToken, tokenType: 'Bearer' }
  }

  public async refresh(user: User, oldRefreshToken: string, role: Role): Promise<JwtResult> {
    const payload: JwtPayload = { email: user.email, name: user.name, role: role }

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

  public async createProxmoxUser(email: string, password: string, groups: Exclude<Role, 'admin'>): Promise<string> {
    return this.proxmoxService.createUser(email, password, groups)
  }

  public async getAccessTicket(email: string, password: string): Promise<AccessTicketCookie> {
    return this.proxmoxService.accessTicket(email, password)
  }
}
