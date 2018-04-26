import { Get, Res, Req, Controller, UseFilters } from '@nestjs/common'
import { Request, Response } from 'express'
import * as Client from '../client/main'

@Controller()
export class AppController {
  @Get('/api/initcount')
  initCount(@Req() req: Request, @Res() res: Response) {
    res.send({
      count: 100
    })
  }

  @Get('*')
  async index(@Req() req: Request, @Res() res: Response) {
    let ctx = Client.main(req.url)
    console.log('before render')
    let html = await ctx.render()
    console.log('rendered')
    res.render('index', { html, state: ctx.state })
  }
}
