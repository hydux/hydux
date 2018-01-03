import { ActionResult, ActionState, ActionCmdResult, ActionType, ActionsType } from './types'
import Cmd, { CmdType, Sub } from './cmd'
import { set, merge, setDeep, get, isFn, noop } from './utils'

export { CmdType, Sub, ActionResult, ActionState, ActionCmdResult, ActionType, ActionsType }

export type Init<S, A> = () => S | [S, CmdType<A>]
export type View<S, A> = (state: S, actions: A) => any
export type Subscribe<S, A> = (state: S) => CmdType<A>
export type OnUpdate<S, A> = <M>(data: { prevAppState: S, nextAppState: S, msgData: M, action: string }) => void

export { Cmd, noop }

export interface AppProps<State, Actions> {
  init: Init<State, Actions>,
  view: View<State, Actions>
  actions: ActionsType<State, Actions>,
  subscribe?: Subscribe<State, Actions>,
  // middlewares: ((action: MyAction<any, State, Actions>, key: string, path: string[]) => MyAction<any, State, Actions>)[],
  onRender?: (view: any) => void,
  onError?: (err: Error) => void,
  onUpdate?: OnUpdate<State, Actions>,
}
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param action
 * @param msg
 * @param state
 * @param actions
 */
export function runAction<A, State, Actions>(action: (msg: A) => any, msg: A, state: State, actions: Actions): ActionCmdResult<State, Actions> {
  let result = action(msg)
  isFn(result) && (result = result(state, actions)) &&
  isFn(result) && (result = result(actions))
  // action can be a function that return a promise or undefined(callback)
  if (
    result === undefined ||
    (result.then && isFn(result.then))
  ) {
    return [state, Cmd.none]
  }

  if (result instanceof Array) {
    return result as any
  }
  return [result, Cmd.none]
}

export type App<State, Actions> = (props: AppProps<State, Actions>) => any

export default function app<State, Actions>(props: AppProps<State, Actions>) {
  // const appEvents = props.events || {}
  const appActions = {} as Actions
  const appSubscribe = props.subscribe || (_ => Cmd.none)
  const render = props.onRender || noop
  const onError = props.onError || noop
  // const appMiddlewares = props.middlewares || []
  let [appState, cmd] = runAction(props.init, void 0, void 0 as any as State, appActions) as [State, CmdType<Actions>]
  init(appState, appActions, props.actions, [])
  cmd.forEach(sub => sub(appActions))
  appRender(appState)
  appSubscribe(appState).forEach(sub => sub(appActions))

  return {
    ...props,
    actions: appActions,
    getState() { return appState },
    render: appRender,
  }

  function appRender(state = appState) {
    if (state !== appState) {
      appState = state
    }
    let view
    if (isFn(view = props.view(appState, appActions))) {
      view = view(appActions)
    }
    try {
      return render(view)
    } catch (err) {
      console.error(err)
      onError(err)
    }
  }

  function init(state, actions, from: ActionsType<State, Actions> | ActionType<any, State, Actions>, path: string[]) {
    for (const key in from) {
      isFn(from[key])
        ? ((key, action: ActionType<any, State, Actions>) => {
          actions[key] = function(msgData) {
            state = get(path, appState)
            // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
            let nextState = state
            let nextAppState = appState
            let cmd = Cmd.none
            try {
              [nextState, cmd] = runAction(action, msgData, state, actions)
            } catch (error) {
              console.error(error)
              onError(error)
            }

            if (props.onUpdate) {
              nextAppState = setDeep(path, merge(state, nextState), appState)
              props.onUpdate({
                prevAppState: appState,
                nextAppState,
                msgData,
                action: path.concat(key).join('.')
              })
            }

            if (nextState !== state) {
              appState = nextAppState !== appState
                ? nextAppState
                : setDeep(path, merge(state, nextState), appState)
              appRender(appState)
            }
            cmd.forEach(sub => sub(actions))
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
