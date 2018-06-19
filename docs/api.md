# API Tutorial

### app(props: AppProps<State, Actions>)

Run your app.

#### AppProps<State, Actions>

##### init: () => State | { state: State, cmd?: CmdType }

An function to get the initial state of your app, you can return a tuple including side effects like an action.

##### actions

The actions of your app, you can only using actions to update your state.

Actions result should be the state or the same level state if this is a nested action. You can also return undefined/Promise to support async task, but this is highly **not** recommanded, you should using Cmd to manager your side effects.

Actions can be nested, here are some legally action signatures:

```js
app({
  init: () => ({ count: 1 }),
  actions: {
    // (msg: Msg) => (state: State), update the state by msg
    reset: n => ({ count: 1 })
    // (msg: Msg) => (state: State) => (state: State)
    // update the state by msg and current state, shorthand for state only
    add: n => state => ({ count: state.count + n }),
    // (msg: Msg) => (state: State, actions: Actions) => void
    // update the state by state and other same level actions
    add12: () => (state, actions) => actions.add(12),
    // (msg: Msg) => (state: State, actions: Actions) => { state:? State, cmd?: CmdType<State, Actions> } // action with side effect (command)
    // (msg: Msg) => (state: State, actions: Actions) => CmdType<State, Actions // Shorthand for command only
    // update the state by side effects
    remoteAdd: () => (state, actions) => ({
      state,
      cmd: Cmd.ofPromise(
        () => fetch('http://your.server/some/path'),
        null,
        actions.add,
        console.log
      )
    })
      ,
  },
  view: //...
})
```

##### onRender: ?((view: any) => void)

Custom renderer, optional. Used by vdom adaptors like hydux-react or `hydux/lib/enhancers/ultradom-render.js`.

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

##### Cmd.map<Actions, SubActions>(map: (action: Actions) => SubActions, cmd: CmdType<SubActions>): CmdType<Actions>

Map a command to a low level command.


### Helpers


### replace
