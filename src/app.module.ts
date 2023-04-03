import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'

import { config } from 'src/config'
import { UserModule } from 'src/modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: `envs/.env.${process.env.ENV_NAME ?? 'development'}`,
      load: [config],
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
