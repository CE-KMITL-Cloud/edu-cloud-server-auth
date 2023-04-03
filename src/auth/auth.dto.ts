import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

import { ValidatePassword } from 'src/decorator/validatePassword'

export class TokenDTO {
  @ApiProperty({
    name: 'refreshToken',
    description: 'A refresh token, use to get a new access token in case of expiry',
    type: String,
  })
  @IsString()
  refreshToken: string
}

export class TokenResponseDTO {
  @ApiProperty({
    name: 'accessToken',
    description: 'An access token, use as a Bearer token in protected HTTP request.',
    type: String,
  })
  @IsString()
  accessToken: string

  @ApiProperty({
    name: 'refreshToken',
    description: 'A refresh token, use to get a new access token in case of expiry',
    type: String,
  })
  @IsString()
  refreshToken: string

  @ApiProperty({
    name: 'tokenType',
    description: 'Type of token given in the response e.g. Bearer, etc.',
    type: String,
  })
  tokenType: string
}

export class LoginDTO {
  @ApiProperty({
    name: 'identifier',
    description: `user's email or username`,
    type: String,
  })
  @IsString()
  identifier: string

  @ApiProperty({
    name: 'password',
    description: `user's password`,
    type: String,
  })
  @IsString()
  password: string
}

export class LoginResponseDTO extends TokenResponseDTO {}

export class RegisterResponseDTO extends TokenResponseDTO {}

export class ForgotPasswordDTO {
  @ApiProperty({
    name: 'identifier',
    description: `user's email or username`,
    type: String,
  })
  @IsString()
  identifier: string
}

export class ForgotPasswordResponseDTO {
  @ApiProperty({
    name: 'referenceCode',
    description: `Reference code of the OTP`,
    type: String,
  })
  @IsString()
  referenceCode: string

  @ApiProperty({
    name: 'partialEmail',
    description: `Partially user's email`,
    type: String,
  })
  @IsString()
  partialEmail: string
}

export class ResetPasswordDTO {
  @ApiProperty({
    name: 'identifier',
    description: `user's email or username`,
    type: String,
  })
  @IsString()
  identifier: string

  @ApiProperty({
    name: 'otp',
    description: `OTP from email`,
    type: String,
  })
  @IsString()
  otp: string

  @ApiProperty({
    name: 'password',
    description: `New password`,
    type: String,
  })
  @ValidatePassword()
  password: string
}

export class ChangePasswordDTO {
  @ApiProperty({
    name: 'oldPassword',
    description: `Old password`,
    type: String,
  })
  @IsString()
  oldPassword: string

  @ApiProperty({
    name: 'newPassword',
    description: `New password`,
    type: String,
  })
  @ValidatePassword()
  newPassword: string
}

export class CreateAdminDTO {
  @ApiProperty({
    name: 'token',
    type: String,
  })
  @IsString()
  token: string
}
