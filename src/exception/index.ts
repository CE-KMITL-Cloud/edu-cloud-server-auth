import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'

// * Incorrect password as bad request because it's used when user input incorrect password for some case e.g. change password
export class IncorrectPasswordException extends BadRequestException {
  constructor() {
    super('Incorrect password')
  }
}

export class LoginFailedException extends UnauthorizedException {
  constructor() {
    super('Login failed')
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User Not Found')
  }
}

export class OtpVerificationFailed extends UnauthorizedException {
  constructor() {
    super('OTP verification failed')
  }
}

export class DuplicateDataException extends ConflictException {
  constructor(duplicatedKeys: string[]) {
    super(`duplicate data for field(s): ${duplicatedKeys.join(',')}`)
  }
}
