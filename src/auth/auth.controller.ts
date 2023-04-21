import {
  BadRequestException,
  Body,
  Controller,
  Post,
  PreconditionFailedException,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import dayjs from 'dayjs'
import { Response } from 'express'

import { isUserRole } from 'src/types/type-guard'

import { CurrentUser } from 'src/decorator/currentUser'
import { JwtAuth } from 'src/decorator/jwtAuth'

import { generateSalt, getHashedPassword } from 'src/utils/getHash'

import {
  ChangePasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  RegisterResponseDTO,
  TokenDTO,
  TokenResponseDTO,
} from './auth.dto'
import { AuthService } from './auth.service'

import { IncorrectPasswordException, LoginFailedException, UserNotFoundException } from 'src/exception'
import { CreateUserDTO } from 'src/modules/user/user.dto'
import { UserService } from 'src/modules/user/user.service'
import { JwtPayload, User } from 'src/types'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Post('user/login')
  @ApiBody({ type: LoginDTO })
  public async login(
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDTO> {
    try {
      const { user, role } = await this.userService.getUserAndRoleFromTable(loginDto.email)

      if (!user) throw new LoginFailedException()

      const result = await this.authService.validate(user, loginDto.password)

      if (!result.success) {
        throw new LoginFailedException()
      }

      const cookie = await this.authService.getAccessTicket(user.email, result.data)

      for (const [key, value] of Object.entries(cookie)) {
        response.cookie(key, value, {
          expires: dayjs().add(1, 'day').toDate(),
        })
      }

      return this.authService.login(user, role)
    } catch (err) {
      // * force return 401 for login
      throw new LoginFailedException()
    }
  }

  @Post('user/token')
  @ApiBody({ type: TokenDTO })
  public async token(@Body() tokenDto: TokenDTO): Promise<TokenResponseDTO> {
    const validationResult = await this.authService.validateRefreshToken(tokenDto.refreshToken)

    if (!validationResult) {
      throw new UnauthorizedException('Invalid Token')
    }

    const { user, role } = await this.userService.getUserAndRoleFromTable(validationResult.email)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const result = await this.authService.refresh(user, tokenDto.refreshToken, role)

    return result
  }

  @Post('user/register')
  @ApiBody({ type: CreateUserDTO })
  public async register(@Body() createUserDto: CreateUserDTO): Promise<RegisterResponseDTO> {
    if (!isUserRole(createUserDto.role)) {
      throw new BadRequestException()
    }

    const existedUser = await this.userService.checkExistingUser(createUserDto.email)

    if (existedUser) {
      throw new PreconditionFailedException('Existed Username or Email')
    }

    const salt = generateSalt()
    const hashedPassword = getHashedPassword(createUserDto.password, salt)

    // * Proxmox
    if (createUserDto.role !== 'admin') {
      await this.authService.createProxmoxUser(createUserDto.email, hashedPassword, createUserDto.role)
    }

    const user: User = await this.userService.createUser(
      createUserDto.name,
      createUserDto.email,
      createUserDto.role,
      hashedPassword,
      salt,
    )

    return this.authService.login(user, createUserDto.role)
  }

  @Post('user/change-password')
  @JwtAuth()
  @ApiBody({ type: ChangePasswordDTO })
  @ApiCreatedResponse()
  public async changePassword(@CurrentUser() userInfo: JwtPayload, @Body() body: ChangePasswordDTO): Promise<void> {
    const user = await this.userService.getByEmail(userInfo.email)

    if (!user) {
      throw new UserNotFoundException()
    }

    const validationResult = await this.authService.validate(user, body.oldPassword)

    if (!validationResult) {
      throw new IncorrectPasswordException()
    }

    const salt = generateSalt()
    const hashedPassword = getHashedPassword(body.newPassword, salt)

    await this.userService.changePassword(userInfo.email, hashedPassword, salt)
  }
}
