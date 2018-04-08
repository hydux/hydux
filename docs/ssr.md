# Server-Side Rendering Tutorial

## How

Server-Side Rendering is super simple in the Elm Architechture, because we already split init, update and view.

Not like next.js, we don't need to add a conventional magic lifecycle method(`getInitProps`), because there already has a powerful `init` funciton, which contains initial model and initial command. What we need to do is just run initial command on the server side, and ignore it on the client side, and synchronize state on the client and server side by adding some conditional compilation. Then we get an **isomorphic app** for free!

## Example App

If you cann't wait, here is a [demo app](https://github.com/hydux/hydux/tree/master/examples/router-ssr) with built-in router in the examples folder.

```sh
cd ./examples/router-ssr
yarn
yarn start
```

## Steps

### Step 1

Add `withSSR` enhancer and add remove `withReact` enhancer when running on the server side.

```ts
import * as Hydux from 'hydux'
let withEnhancers = Hydux.compose(
  //... other enhancers
  __is_browser
    ? withReact<State.State, State.Actions>(
      document.getElementById('root'),
      { hydrate: true },
    )
    // Inject `renderToString` to Hydux on the server side, so we can call `ctx.render` to run all init commands.
    : withSSR<State.State, State.Actions>({
      renderToString(view) {
        return ReactDOM.renderToString(view)
      },
    }),
)

let app = withEnhancers(Hydux.app)
```

> Note: `__is_browser` is a global variable to indicate the current environment is server side or browser side.

### Step 2

On your top `init` function, running commands only when on the server side,

```ts

const initState = {
  //... the empty initial state of your app
}
export const init: Init<State, Actions> = () => [
  // Synchronize the server-side state to client by print the state on the html
  global.__INIT_STATE__ || initState,
  // Since the init command is already executed on the server side, we can simply ignore it on the browser side.
  __is_browser
    ? Cmd.none
    : Cmd.batch(
        Cmd.map(_ => _.counter, Counter.initCmd())
      )
]
```

### Step 3

Rendering the html and state on your favorate web framework, koa, hapi, express, nestjs, don't need any extra integrations!

Here we use nestjs as example, only three lines are we added.

```ts
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
    // Get the app context from client, note here we passed the path to the client router.
    let ctx = Client.main(req.path)
    // Rendering it to html, this will also run all initial commands.
    let html = await ctx.render()
    // Render the html and state to client
    res.render('index', { html, state: ctx.state })
  }
}

```

That's it! All API and steps are simple, explicit and based on the power of the Elm Architechture (TEA), we don't need to read tons of docs and try hard to figure out lots of examples, tutorials and APIs. This is the charm of TEA.
