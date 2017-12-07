import { ActionResult, ActionState, ActionStateWithCmd, MyAction, MyActions } from './types'
import Cmd, { CmdType } from './cmd'
import { set, merge, setDeep, get, isFunction } from './utils'

export type AppProps<State = any, Actions = any> = {
  init: () => State | [State, CmdType<State, Actions>] ,
  view: (appState: State) => ((actions: Actions) => any)
  actions: MyActions<State, Actions>,
  subscribe?: (state: State) => CmdType<State, Actions>,
  // middlewares: ((action: MyAction<any, State, Actions>, key: string, path: string[]) => MyAction<any, State, Actions>)[],
  render?: (view: any) => void,
  onError?: (err: Error) => void,
  onUpdate?: <M>(prevState: State, nextState: State, msg: M, actionName: string, path: string[]) => void,
}

function normalizeActionResult<State, Actions>(result, state): ActionStateWithCmd<State, Actions> {
  if (isFunction(result)) {
    result = result(state)
  }

  if (result instanceof Array) {
    return result as any
  }
  return [result, Cmd.none]
}

export type App<State, Actions> = (props: AppProps<State, Actions>) => any

export default function app<State, Actions>(props: AppProps<State, Actions>) {
  // const appEvents = props.events || {}
  const appActions = {} as MyActions<State, Actions>
  const appSubscribe = props.subscribe || (_ => Cmd.none)
  const render = props.render || console.log
  const onError = props.onError || console.error
  // const appMiddlewares = props.middlewares || []
  let [appState, cmd] = normalizeActionResult(props.init(), void 0) as [State, CmdType<State, Actions>]

  init(appState, appActions, props.actions, [])
  cmd.forEach(sub => sub(appActions))
  appRender(appState)
  appSubscribe(appState).forEach(sub => sub(appActions))

  return {
    ...props,
    actions: appActions,
    getState() { return appState },
    render: appRender
  }

  function appRender(state = appState) {
    if (state !== appState) {
      appState = state
    }
    let view
    if (isFunction(view = props.view(appState))) {
      view = view(appActions)
    }
    try {
      render(view)
    } catch (err) {
      onError(err)
    }
  }

  function init(state, actions, from: MyActions<State, Actions> | MyAction<any, State, Actions>, path: string[]) {
    for (const key in from) {
      isFunction(from[key])
        ? ((key, action: MyAction<any, State, Actions>) => {
          actions[key] = function(msg) {
            state = get(path, appState)
            // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
            let nextState = state
            let nextAppState = appState
            let cmd = Cmd.none
            try {
              [nextState, cmd] = normalizeActionResult(action(msg), state)
            } catch (error) {
              onError(error)
            }

            if (props.onUpdate) {
              nextAppState = setDeep(path, merge(state, nextState), appState)
              props.onUpdate(appState, nextAppState, msg, key, path)
            }

            if (nextState !== state) {
              appState = nextAppState !== appState ? nextAppState : setDeep(path, merge(state, nextState), appState)
              appRender(appState)
              cmd.forEach(sub => sub(appActions))
            }

            return msg
          }
        })(key, from[key])
        : init(
            state[key] || (state[key] = {}),
            (actions[key] = {}),
            from[key],
            path.concat(key)
          )
    }
  }
}
