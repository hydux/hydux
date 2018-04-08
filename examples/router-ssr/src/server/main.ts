(global as any).__is_browser = false
;(global as any).__dev = false

import { NestFactory } from '@nestjs/core'
import { ApplicationModule } from './app.module'
import * as express from 'express'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule)
  app.use(((req, res, next) => {
    if (req.path.startsWith('static')) {
      express.static(path.join(__dirname, '../../static'))(req, res, next)
    } else {
      next()
    }
  }) as express.Handler)
  app.set('view', `${__dirname}/views`)
  app.set('view engine', 'ejs')
  await app.listen(8085, '0.0.0.0')
}
bootstrap()
