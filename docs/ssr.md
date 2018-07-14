# Server-Side Rendering Tutorial

## How

Server-Side Rendering is super simple in the Elm Architechture, because we already split our code with init, update and view.

Not like next.js, we don't need to add a conventional magic lifecycle method(`getInitialProps`), because we already have a powerful `init` function, which contains initial model and initial command, what we need to do is just running initial command on the server side, and ignore it on the client side, then synchronize state between the client and server by adding some conditionals. Then we get an **isomorphic app** for free!

## Example App

If you can't wait, here is a [demo app](https://github.com/hydux/hydux/tree/master/examples/router-ssr) with built-in router in the examples folder.

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


export const routes: NestedRoutes<State, Actions> = {
  path: '/',
  action: loc => state => ({
    ...state,
    page: 'home'
  }),
  children: [{
    path: '/counter2',
    update: (loc) => ({
      state: {
        page: 'counter2'
      },
      cmd: subComps.cmds.counter2, // init side effect commands in router changes
    }),
  }, {
    path: '*',
    action: loc => state => ({
      ...state,
      page: '404'
    }),
  }]
}

export function main(path?: string) {
  let withEnhancers = Hydux.compose(
    withRouter<State.State, State.Actions>({
      history:
        __is_browser
          ? State.history
          // Since there are no history API on the server side, we should use MemoryHistory here. The initPath are from your server controller.
          : new MemoryHistory({ initPath: path }) ,
      routes: routes,
    }),
    __is_browser
      ? withReact<State.State, State.Actions>(
        document.getElementById('root'),
        { hydrate: true },
      )
      // Inject `renderToString` to Hydux on the server side, so we can call `ctx.render` to run all init commands and render the vdom to html string.
      : withSSR<State.State, State.Actions>({
        renderToString(view) {
          return ReactDOM.renderToString(view)
        },
      }),
  )
  let app = withEnhancers(Hydux.app)
  // ...
```

> Note: `__is_browser` is a global variable to indicate the current environment is server side or browser side.

### Step 2

On your top `init` function, running commands only when on the server side,

```ts

const initState = {
  //... the empty initial state of your app
}
export const init: Init<State, Actions> = () => {
  // Synchronize the server-side state to client by print the state on the html,
  // we don't need init commands here, because we need to init commands in router actions.
  state: global.__INIT_STATE__ || initState,
}
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
    // Get the app context from client, note here we passed the path and query to the client router.
    let ctx = Client.main(req.url)
    // Rendering it to html, this will also run all initial commands.
    let html = await ctx.render()
    // Render the html and state to client
    res.render('index', { html, state: ctx.state })
  }
}

```

That's it! APIs are simple, explicit and powerful. Based on **The Elm Architechture (TEA)**, we don't need to read tons of docs, examples, tutorials, APIs and try hard to figure out them. That is why Elm is fascinating.
