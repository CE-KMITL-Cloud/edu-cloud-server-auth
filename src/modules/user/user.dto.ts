import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class CreateUserDTO {
  @ApiProperty({ name: 'email', description: 'Unique email of the account', example: 'hello@gmail.com', type: String })
  @IsString()
  @IsEmail()
  email: string

  @ApiProperty({ name: 'password', description: 'Password of the account', example: '12345678', type: String })
  @IsString()
  password: string

  @ApiProperty({ name: 'name', description: 'name of the account', example: 'someone yoo', type: String })
  @IsString()
  name: string

  @ApiProperty({ name: 'role', description: 'role of user', example: 'student', type: String })
  role: string
}
