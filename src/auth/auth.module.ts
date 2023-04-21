import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategy/jwt.strategy'

import { getCacheFactory } from 'src/cache/cache.utils'
import { ProxmoxService } from 'src/modules/proxmox/proxmox.service'
import { UserModule } from 'src/modules/user/user.module'

const cacheFactory = getCacheFactory('auth')

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwtSecret'),
        signOptions: { expiresIn: 60 * 60 },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy, ProxmoxService, cacheFactory],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
