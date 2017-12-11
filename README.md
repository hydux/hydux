# Hydux

[![Build Status](https://travis-ci.org/hydux/hydux.svg?branch=master)](https://travis-ci.org/hydux/hydux) [![npm](https://img.shields.io/npm/v/hydux.svg)](https://www.npmjs.com/package/hydux) [![npm](https://img.shields.io/npm/dm/immuter.svg)](https://www.npmjs.com/package/hydux)

A React-Compatible fork of [Hyperapp](https://github.com/hyperapp/hyperapp), an Elm-like state manager inspired by [Elmish](https://github.com/fable-elmish/elmish), Elm, Redux, etc. Working with any vdom library!

## Features

* [hyperapp](https://github.com/hyperapp/hyperapp) compatible API
* Support any vdom library, including react ([official support](https://github.com/hydux/hydux-react))
* [Official support for react-router](https://github.com/hydux/hydux-react-router)
* hot reload (hmr), logger, persist, [Redux Devtools](https://github.com/zalmoxisus/redux-devtools-extension), picodom([1kb vdom](https://github.com/picodom/picodom)), ****All in One****, easily setup all these fancy stuff without pain!
* Elm-like side effect manager and subscribe API

![](media/timetravel.gif)

## Install

```sh
yarn add hydux # or npm i hydux
```

## Quick Example

Let's say we got a counter, like this.

```js
// Counter.js
export default {
  init: () => ({ count: 1 }),
  actions: {
    down: () => state => ({ count: state.count - 1 }),
    up: () => state => ({ count: state.count + 1 })
  },
  view: (state: State) => (actions: Actions) =>
    <div>
      <h1>{state.count}</h1>
      <button onclick={actions.down}>–</button>
      <button onclick={actions.up}>+</button>
    </div>
}
```

Then we can compose it in Elm way, you can easily reuse your components.

```js
import _app from 'hydux'
import withPersist from 'hydux/lib/enhancers/persist'
import withPicodom, { h, React } from 'hydux/lib/enhancers/picodom-render'
import Counter from './counter'

// let app = withPersist<State, Actions>({
//   key: 'my-counter-app/v1'
// })(_app)

// use built-in 1kb picodom to render the view.
let app = withPicodom()(_app)

if (process.env.NODE_ENV === 'development') {
  // built-in dev tools, without pain.
  const devTools = require('hydux/lib/enhancers/devtools').default
  const logger = require('hydux/lib/enhancers/logger').default
  const hmr = require('hydux/lib/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

const actions = {
  counter1: Counter.actions,
  counter2: Counter.actions,
}

const state = {
  counter1: Counter.init(),
  counter2: Counter.init(),
}

const view = (state: State) => (actions: Actions) =>
    <main>
      <h1>Counter1:</h1>
      {Counter.view(state.counter1)(actions.counter1)}
      <h1>Counter2:</h1>
      {Counter.view(state.counter2)(actions.counter2)}
    </main>

export default app({
  init: () => state,
  actions,
  view,
})
```

## Actions with Cmd

This library also implemented a Elm-like side effects manager, you can simple return a tuple (two elements array) in your action, and put the Cmd as the second element.
e.g.

```js
import app, { Cmd } from 'hydux'

function upLater(n) {
  return new Promise(resolve => setTimeout(() => resolve(n + 10), 1000))
}
app({
  init: () => ({ count: 1}),
  actions: {
    down: () => state => ({ count: state.count - 1 }),
    up: () => state => ({ count: state.count + 1 }),
    upN: n => state => ({ count: state.count + n }),
    upLater: n => state => actions/* actions of same level */ => [
      state, // don't change the state, won't trigger view update
      Cmd.ofPromise(
        upLater /* a function with single parameter and return a promise */,
        n /* the parameter of the funciton */,
        actions.upN /* success handler, optional */,
        console.error /* error handler, optional */ )
    ]
  },
  view: () => {/*...*/} ,
})
```

## API

### app(props: AppProps<State, Actions>)

Run your app.

#### AppProps<State, Actions>

##### init: () => State | [ State, CmdType ]

An function to get the initial state of your app, you can return a tuple including side effects like an action.

##### actions

The actions of your app, you can only using actions to update your state.

Actions result should be the state or the same level state if this is a nested action. You can also return undefined/Promise to support async task, but this is highly **not** recommanded, you should using Cmd to manager your side effects.

Actions can be nested, here are some legally action signatures:

```js
init: () => ({ count: 1 })
actions: {
  // (msg: Msg) => (state: State), update the state by msg
  reset: n => ({ count: 1 })
  // (msg: Msg) => (state: State) => (state: State)
  // update the state by msg and current state
  add: n => state => ({ count: state.count + n }),
  // (msg: Msg) => (state: State) => (actions: Actions) => void
  // update the state by state and other same level actions
  add12: () => state => actions => actions.add(12),
  // (msg: Msg) => (state: State) => (actions: Actions) => [state, CmdType<State, Actions>]
  // update the state by side effects
  remoteAdd: () => state => actions =>
    [state,
      Cmd.ofPromise(
        () => fetch('http://your.server/some/path'),
        null,
        actions.add,
        console.log
      )],
}
```

##### subscribe: ?((state: State) => CmdType<State, Actions>)

subscribe is a function return a CmdType, you can subscribe side effects like web socket messages, location changes in here.

##### onError: ?((error: Error) => void)

Error handler, optional.

##### onRender: ?((view: any) => void)

Custom renderer, optional. Used by vdom adaptors like hydux-react or `hydux/lib/enhancers/picodom-render.js`.

##### onUpdate: ?((data) => void)

Update listener, optional, used by something like `hydux/lib/enhancers/logger.js`, `hydux/lib/enhancers/devtools.js`

#### Cmd

Elm-like side effects manager.

##### Cmd.none

Empty side effects.

##### Cmd.ofPromise<A, T>(task: (arg: A) => Promise<T>, (arg: A), succeedHandler: (result: T) => void, failedHandler: (err: Error) => void): CmdType<State, Actions>

Cmd from a function that return a promise.

##### Cmd.ofFn<A, T>(task: (arg:A) => T, (arg: A), succeedHandler: (result: T) => void, failedHandler: (err: Error) => void): CmdType<State, Actions>

Cmd from a function that could throw an error.

##### Cmd.ofSub(sub: (actions: Actions) => void): CmdType<State, Actions>

Cmd from a sub.

##### Cmd.batch(...args: CmdType<State,Actions>[] | CmdType<State,Actions>[][]): CmdType<State,Actions>

Cmd from a cmd array.

### [Try it online!](https://codepen.io/zaaack/pen/zPgodL)

## Counter App

```sh
git clone https://github.com/hydux/hydux.git
cd examples/counter
yarn # or npm i
npm start
```

Now open <http://localhost:8080> and hack!


## Why

After trying [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish) for several month, I need to write a small web App in my company, for many reasons I cannot choose some fancy stuff like [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish), simply speaking, I need to use the mainstream JS stack but don't want to bear Redux's cumbersome, complex toolchain, etc anymore.

After some digging around, hyperapp looks really good to me, but I quickly find out it doesn't work with React, and many libraries don't work with the newest API. So I create this to support ****different**** vdom libraries, like React([official support](https://github.io/hydux/hydux-react)), [picodom](https://github.com/picodom/picodom)([built-in](https://github.com/hydux/hydux/blob/master/src/enhancers/picodom-render.ts)), Preact, [inferno](https://github.com/infernojs/inferno) or what ever you want, just need to write a simple enhancer!

Also, to avoid breaking change, we have ****built-in**** support for HMR, logger, persist, [Redux Devtools](https://github.com/zalmoxisus/redux-devtools-extension), you know you want it!

## License

MIT
