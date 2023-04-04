import { Body, Controller, Post, PreconditionFailedException, UnauthorizedException } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

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
  public async login(@Body() loginDto: LoginDTO): Promise<LoginResponseDTO> {
    try {
      const user = await this.userService.getByEmail(loginDto.email)

      if (!user) throw new LoginFailedException()

      const result = await this.authService.validate(user, loginDto.password)

      if (result) {
        return this.authService.login(user)
      }

      throw new LoginFailedException()
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

    const user = await this.userService.getByEmail(validationResult.email)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const result = await this.authService.refresh(user, tokenDto.refreshToken)

    return result
  }

  @Post('user/register')
  @ApiBody({ type: CreateUserDTO })
  public async register(@Body() createUserDto: CreateUserDTO): Promise<RegisterResponseDTO> {
    const existedUser = await this.userService.checkExistingUser(createUserDto.email)

    if (existedUser) {
      throw new PreconditionFailedException('Existed Username or Email')
    }

    const salt = generateSalt()
    const hashedPassword = getHashedPassword(createUserDto.password, salt)

    const user: User = await this.userService.createUser(createUserDto.name, createUserDto.email, hashedPassword, salt)

    return this.authService.login(user)
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
