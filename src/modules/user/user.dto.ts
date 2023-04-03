import { ApiProperty } from '@nestjs/swagger'
import { IsAlphanumeric, IsEmail, IsString } from 'class-validator'

export class CreateUserDTO {
  @ApiProperty({ name: 'username', description: 'Unique username of the account', example: 'hello', type: String })
  @IsString()
  @IsAlphanumeric()
  username: string

  @ApiProperty({ name: 'email', description: 'Unique email of the account', example: 'hello@gmail.com', type: String })
  @IsString()
  @IsEmail()
  email: string

  @ApiProperty({ name: 'password', description: 'Password of the account', example: '12345678', type: String })
  @IsString()
  password: string
}
