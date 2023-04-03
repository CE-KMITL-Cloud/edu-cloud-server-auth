import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { JwtPayload } from 'src/types'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super()
  }

  public handleRequest = (err: any, user: JwtPayload): any => {
    if (err || !user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
