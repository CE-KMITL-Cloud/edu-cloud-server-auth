import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

import { Config } from 'src/config/config'

import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger()

  const app = await NestFactory.create(AppModule)

  // ! Disable this
  app.enableCors()

  app.use(cookieParser())

  let docPath = 'doc'
  if (process.env.NODE_ENV == 'production') {
    docPath = 'something-that-can-not-give-to-user-know-doc'
  }

  const config = new DocumentBuilder()
    .setTitle('edu cloud server auth')
    .setDescription('The auth API for edu-cloud')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(docPath, app, document)

  const configService = app.get<ConfigService<Config, true>>(ConfigService)
  const port = configService.get('port')

  await Promise.all([app.listen(port)])

  logger.log(`Application started at port ${port}`)
}

bootstrap()
