(global as any).__is_browser = false
;(global as any).__dev = false

import { NestFactory } from '@nestjs/core'
import { ApplicationModule } from './app.module'
import * as express from 'express'
import * as path from 'path'
import ejs from 'ejs'

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule)
  app.use(((req, res, next) => {
    res.locals.assets_url = 'http://127.0.0.1:8081'
    if (req.path.startsWith('static')) {
      express.static(path.join(__dirname, '../../static'))(req, res, next)
    } else {
      next()
    }
  }) as express.Handler)
  app.set('views', `${__dirname}/views`)
  app.set('view engine', 'ejs')
  await app.listen(3456, '0.0.0.0')
}
bootstrap()
