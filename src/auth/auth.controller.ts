import { Body, Controller, Post, PreconditionFailedException, UnauthorizedException } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'

import { CurrentUser } from 'src/decorator/currentUser'
import { JwtAuth } from 'src/decorator/jwtAuth'

import {
  ChangePasswordDTO,
  LoginDTO,
  LoginResponseDTO,
  RegisterResponseDTO,
  ResetPasswordDTO,
  TokenDTO,
  TokenResponseDTO,
} from './auth.dto'
import { AuthService } from './auth.service'

import {
  IncorrectPasswordException,
  LoginFailedException,
  OtpVerificationFailed,
  UserNotFoundException,
} from 'src/exception'
import { CreateUserDTO } from 'src/modules/user/user.dto'
import { UserService } from 'src/modules/user/user.service'
import { JwtPayload, User } from 'src/types'

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Post('user/login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() loginDto: LoginDTO): Promise<LoginResponseDTO> {
    try {
      const user =
        (await this.userService.getByUsername(loginDto.identifier)) ??
        (await this.userService.getByEmail(loginDto.identifier))

      if (!user) throw new LoginFailedException()

      console.log('user', user)

      const result = await this.authService.validate(user, loginDto.password)

      if (result) {
        return this.authService.login(user)
      }

      throw new LoginFailedException()
    } catch (err) {
      //force return 401 for login
      throw new LoginFailedException()
    }
  }

  @Post('user/token')
  @ApiBody({ type: TokenDTO })
  async token(@Body() tokenDto: TokenDTO): Promise<TokenResponseDTO> {
    const validationResult = await this.authService.validateRefreshToken(tokenDto.refreshToken)

    if (!validationResult) {
      throw new UnauthorizedException('Invalid Token')
    }

    const user = await this.userService.getByUsername(validationResult.username)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const result = await this.authService.refresh(user, tokenDto.refreshToken)

    return result
  }

  @Post('user/register')
  @ApiBody({ type: CreateUserDTO })
  async register(@Body() createUserDto: CreateUserDTO): Promise<RegisterResponseDTO> {
    const existedUser = await this.userService.checkExistingUser(createUserDto.email, createUserDto.username)

    if (existedUser) {
      throw new PreconditionFailedException('Existed Username or Email')
    }

    const salt = this.authService.generateSalt()
    const hashedPassword = this.authService.getHashedPassword(createUserDto.password, salt)

    const user: User = await this.userService.createUser(createUserDto, hashedPassword, salt)

    return this.authService.login(user)
  }

  @Post('user/reset-password')
  @ApiBody({ type: ResetPasswordDTO })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  async resetPassword(@Body() body: ResetPasswordDTO): Promise<void> {
    const user =
      (await this.userService.getByUsername(body.identifier)) ?? (await this.userService.getByEmail(body.identifier))

    if (!user) throw new UserNotFoundException()

    const validationResult = await this.userService.validateResetPasswordOtp(user.username, body.otp)

    if (!validationResult) throw new OtpVerificationFailed()

    const salt = this.authService.generateSalt()
    const hashedPassword = this.authService.getHashedPassword(body.password, salt)

    await this.userService.changePassword(user.username, hashedPassword, salt)
    return
  }

  @Post('user/change-password')
  @JwtAuth()
  @ApiBody({ type: ChangePasswordDTO })
  @ApiCreatedResponse()
  async changePassword(@CurrentUser() userInfo: JwtPayload, @Body() body: ChangePasswordDTO): Promise<void> {
    const user = await this.userService.getByUsername(userInfo.username)

    if (!user) throw new UserNotFoundException()

    const validationResult = await this.authService.validate(user, body.oldPassword)

    if (!validationResult) {
      throw new IncorrectPasswordException()
    }

    const salt = this.authService.generateSalt()
    const hashedPassword = this.authService.getHashedPassword(body.newPassword, salt)

    await this.userService.changePassword(userInfo.username, hashedPassword, salt)
  }
}
