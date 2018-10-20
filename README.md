# Hydux

[![Build Status](https://travis-ci.org/hydux/hydux.svg?branch=master)](https://travis-ci.org/hydux/hydux) [![npm](https://img.shields.io/npm/v/hydux.svg)](https://www.npmjs.com/package/hydux) [![npm](https://img.shields.io/npm/dm/hydux.svg)](https://www.npmjs.com/package/hydux) [![Join the chat at https://gitter.im/hydux/hydux](https://badges.gitter.im/hydux/hydux.svg)](https://gitter.im/hydux/hydux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A light-weight Elm-like alternative for Redux ecosystem, inspired by [Hyperapp](https://github.com/hyperapp/hyperapp) and [Elmish](https://github.com/fable-elmish/elmish).

## Features

* Elm Architecture, split your whole app with **init**, **state**, **actions**.
* [hyperapp](https://github.com/hyperapp/hyperapp) compatible API
* Elm-like [side effect manager](https://github.com/hydux/hydux#actions-with-cmd) and subscribe API
* Support any vdom library, including react ([official support](https://github.com/hydux/hydux-react))
* [Router (**Recommended**)](https://github.com/hydux/hydux/tree/master/examples/router)
* [Official support for react-router](https://github.com/hydux/hydux-react-router)
* Hot reload (hmr)
* [Server-Side Rendering(SSR)](https://github.com/hydux/hydux/tree/master/docs/ssr.md)
* [code splitting](https://github.com/hydux/hydux/tree/master/examples/code-splitting), seamlessly integrated with SSR.
* logger, persist, [Redux Devtools with time traveling](https://github.com/zalmoxisus/redux-devtools-extension), [ultradom](https://github.com/jorgebucaran/ultradom)(1kb vdom), **\*\*All in One\*\***, easily setup all these fancy stuff without pain!

![timetravel](media/timetravel.gif)

## [Try it online!](https://codepen.io/zaaack/pen/zPgodL)

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
  view: (state: State, actions: Actions) =>
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
import withUltradom, { h, React } from 'hydux/lib/enhancers/ultradom-render'
import Counter from './counter'

// use built-in 1kb ultradom to render the view.
let app = withUltradom()(_app)

const actions = {
  counter1: Counter.actions,
  counter2: Counter.actions,
}

const state = {
  counter1: Counter.init(),
  counter2: Counter.init(),
}

const view = (
  state: State,
  actions: Actions,
) =>
    <main>
      <h1>Counter1:</h1>
      {Counter.view(state.counter1, actions.counter1)}
      <h1>Counter2:</h1>
      {Counter.view(state.counter2, actions.counter2)}
    </main>

export default app({
  init: () => state,
  actions,
  view,
})
```

## Init with Command

You can init the state of your app via plain object, or with side effects, like fetch remote data.

```ts
import * as Hydux from 'hydux'

const { Cmd } = Hydux

export function init() {
  return {
    state: { // pojo state
      count: 1,
    },
    cmd: Cmd.ofSub( // update your state via side effects.
      _ => fetch('https://your.server/init/count') // `_` is the real actions, don't confuse with the plain object `actions` that we created below, calling functions from plain object won't trigger state update!
        .then(res => res.json())
        .then(count => _.setCount(count))
    )
  }
}

export const actions = {
  setCount: n => (state, actions) => {
    return { count: n }
  }
}

```

If we want to init a child component with init command, we need to map it to the sub level via lambda function, just like **type lifting** in Elm.
```ts
// App.tsx
import { React } from 'hydux-react'
import * as Hydux from 'hydux'
import * as Counter from 'Counter'
const Cmd = Hydux.Cmd

export const init = () => {
  const counter1 = Counter.init()
  const counter2 = Counter.init()
  return {
    state: {
      counter1: counter1.state,
      counter2: counter2.state,
    },
    cmd: Cmd.batch(
      Cmd.map((_: Actions) => _.counter1, counter1.cmd), // Map counter1's init command to parent component
      Cmd.map((_: Actions) => _.counter2, counter2.cmd), // Map counter2's init command to parent component
      Cmd.ofSub(
        _ => // some other commands of App
      )
    )
  }
}

export const actions = {
  counter1: Counter.actions,
  counter2: Counter.actions,
  // ... other actions
}

export const view = (state: State, actions: Actions) => (
  <main>
    <h1>Counter1:</h1>
    {Counter.view(state.counter1, actions.counter1)}
    <h1>Counter2:</h1>
    {Counter.view(state.counter2, actions.counter2)}
  </main>
)

export type Actions = typeof actions
export type State = ReturnType<typeof init>['state']
```

This might be too much boilerplate code, but hey, we provide a type-friendly helper function! See:

```ts
// Combine all sub components's init/actions/views, auto map init commands.
const subComps = Hydux.combine({
  counter1: [Counter, Counter.init()],
  counter2: [Counter, Counter.init()],
})
export const init2 = () => {
  return {
    state: {
      ...subComps.state,
      // other state
    },
    cmd: Cmd.batch(
      subComps.cmd,
      // other commands
    )
  }
}


export const actions = {
  ...subComps.actions,
  // ... other actions
}

export const view = (state: State, actions: Actions) => (
  <main>
    <h1>Counter1:</h1>
    {subComps.render('counter1', state, actions)}
    // euqal to:
    // {subComps.views.counter1(state.counter1, actions.counter1)}
    // .render('<key>', ...) won't not work with custom views that not match `(state, actions) => any` or `(props) => any` signature
    // So we still need `.views.counter1(...args)` in this case.
    <h1>Counter2:</h1>
    {subComps.render('counter2', state, actions)}
  </main>
)
```

## Actions with Command

This library also implemented a Elm-like side effects manager, you can simple return a record with state, cmd in your action
e.g.

```ts
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
    upLater: n => (
      state,
      actions/* actions of same level */
    ) => ({
      state, // don't change the state, won't trigger view update
      cmd: Cmd.ofPromise(
        upLater /* a function with single parameter and return a promise */,
        n /* the parameter of the funciton */,
        actions.upN /* success handler, optional */,
        console.error /* error handler, optional */ )
    }),
    // Short hand of command only
    upLater2: n => (
      state,
      actions/* actions of same level */
    ) => Cmd.ofPromise(
      upLater /* a function with single parameter and return a promise */,
      n /* the parameter of the funciton */,
      actions.upN /* success handler, optional */,
      console.error /* error handler, optional */
    ),
  },
  view: () => {/*...*/} ,
})
```

## Parent-Child Components Communication

In Elm, we can intercept child component's message in parent component, because child's update function is called in parent's update function. But how can we do this in hydux?

```js
import * as assert from 'assert'
import * as Hydux from '../index'
import Counter from './counter'

const { Cmd } = Hydux

export function init() {
  return {
    state: {
      counter1: Counter.init(),
      counter2: Counter.init(),
    }
  }
}
const actions = {
  counter2: counter.actions,
  counter1: counter.actions
}
Hydux.overrideAction(
  actions,
  _ => _.counter1.upN,
  (n: number) => (
      action,
      ps: State, // parent state (State)
      pa, // parent actions (Actions)
      // s: State['counter1'], // child state
      // a: Actions['counter1'], // child actions
  ) => {
    const { state, cmd } = action(n + 1)
    assert.equal(state.count, ps.counter1.count + n + 1, 'call child action work')
    return {
      state,
      cmd: Cmd.batch(
        cmd,
        Cmd.ofFn(
          () => pa.counter2.up()
        )
      )
    }
  }
)
type State = ReturnType<typeof init>['state']
type Actions = typeof actions
let ctx = Hydux.app<State, Actions>({
  init: () => initState,
  actions,
  view: noop,
  onRender: noop
})

```

## Documentation

* [API tutorial with examples](https://github.com/hydux/hydux/tree/master/docs/api.md)
* [Generated API Reference](https://hydux.github.io/hydux/api)
* [Server-Side Rendering(SSR) Tutorial](https://github.com/hydux/hydux/tree/master/docs/ssr.md)

## Ecosystem

### Libraries

* [hydux-react](https://github.com/hydux/hydux-react): Hydux's react integration
* [hydux-preact](https://github.com/hydux/hydux-preact): Hydux's [preact](https://github.com/developit/preact) integration
* [hydux-react-router](https://github.com/hydux/hydux-react-router): Hydux's react-router integration
* [hydux-mutator](https://github.com/hydux/hydux-mutator): A statically-typed immutable update help package, which also contains immutable collections.
* [hydux-transitions](https://github.com/hydux/hydux-transitions): A css transition library inspired by [animajs](http://animejs.com/)'s timeline, follow **The Elm Architecture**.
* [hydux-data](https://github.com/hydux/hydux-data): Statically-typed data-driven development for hydux, in the Elm way. Inspired by apollo-client.
* [hydux-pixi](https://github.com/hydux/hydux-pixi): High performance [pixi.js](https://github.com/pixijs/pixi.js) renderer for Hydux.
* [hydux code snippets for vscode (TS)](https://github.com/hydux/hydux/tree/master/docs/hydux.code-snippets) Best practice for using hydux + typescript without boilerplate code.

### Samples

* [samples-antd](https://github.com/hydux/samples-antd): Admin sample in hydux.

## Counter App

```sh
git clone https://github.com/hydux/hydux.git
cd hydux
yarn # or npm i
cd examples/counter
yarn # or npm i
npm start
```

Now open <http://localhost:8080> and hack!

## Why

After trying [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish) for several month, I need to write a small web App in my company, for many reasons I cannot choose some fancy stuff like [Fable](https://fable.io) + [Elmish](https://github.com/fable-elmish/elmish), simply speaking, I need to use the mainstream JS stack but don't want to bear Redux's cumbersome, complex toolchain, etc anymore.

After some digging around, hyperapp looks really good to me, but I quickly find out it doesn't work with React, and many libraries don't work with the newest API. So I create this to support ****different**** vdom libraries, like React([official support](https://github.io/hydux/hydux-react)), [ultradom](https://github.com/jorgebucaran/ultradom)([built-in](https://github.com/hydux/hydux/blob/master/src/enhancers/ultradom-render.ts)), Preact, [inferno](https://github.com/infernojs/inferno) or what ever you want, just need to write a simple enhancer!

Also, to avoid breaking change, we have ****built-in**** support for HMR, logger, persist, [Redux Devtools](https://github.com/zalmoxisus/redux-devtools-extension), you know you want it!

## License

MIT
