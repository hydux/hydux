import { ActionResult, ActionState, ActionCmdResult, ActionType, ActionsType, UnknownArgsActionType, NormalAction } from './types'
import Cmd, { CmdType, Sub } from './cmd'
import { set, merge, setDeep, get, isFn, noop, isPojo, clone } from './utils'
export * from './helpers'
export * from './types'
export { Cmd, CmdType, Sub, ActionResult, noop, isFn, isPojo }

export type Init<S, A> = () => S | [S, CmdType<A>]
export type View<S, A> = (state: S, actions: A) => any
export type Subscribe<S, A> = (state: S) => CmdType<A>
export type OnUpdate<S, A> = <M>(data: { prevAppState: S, nextAppState: S, msgData: M, action: string }) => void
export type OnUpdateStart<S, A> = <M>(data: { action: string }) => void

export interface AppProps<State, Actions> {
  init: Init<State, Actions>,
  view: View<State, Actions>
  actions: ActionsType<State, Actions>,
  subscribe?: Subscribe<State, Actions>,
  // middlewares: ((action: MyAction<any, State, Actions>, key: string, path: string[]) => MyAction<any, State, Actions>)[],
  onRender?: (view: any) => void,
  onUpdate?: OnUpdate<State, Actions>,
  onUpdateStart?: OnUpdateStart<State, Actions>,
}
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction<S, A, PS, PA>(
  result: ActionResult<S, A> | ((state: S, actions: A) => ActionResult<S, A>),
  state: S,
  actions: A,
  parentState?: PS,
  parentActions?: PA,
): ActionCmdResult<S, A> {
  let rst: any = result
  isFn(rst) && (rst = rst(state, actions, parentState, parentActions)) &&
  isFn(rst) && (rst = rst(actions))
  // action can be a function that return a promise or undefined(callback)
  if (
    rst === undefined ||
    (rst.then && isFn(rst.then))
  ) {
    return [state, Cmd.none]
  }
  if (rst instanceof Array) {
    return [rst[0] || state, rst[1] || Cmd.none]
  }
  return [rst, Cmd.none]
}

export function withParents<S, A, PS, PA, A1>(
  action: (a1: A1) => (s: S, a: A) => any,
  wrapper?: (action: (a1: A1) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
)
export function withParents<S, A, PS, PA, A1, A2>(
  action: (a1: A1, a2: A2) => (s: S, a: A) => any,
  wrapper?: (action: (a1: A1, a2: A2) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
)
export function withParents<S, A, PS, PA, A1, A2, A3>(
  action: (a1: A1, a2: A2, a3: A3) => (s: S, a: A) => any,
  wrapper?: (action: (a1: A1, a2: A2, a3: A3) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
)
export function withParents<S, A, PS, PA, A1, A2, A3, A4>(
  action: (a1: A1, a2: A2, a3: A3, a4: A4) => (s: S, a: A) => any,
  wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
)
export function withParents<S, A, PS, PA, A1, A2, A3, A4, A5>(
  action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => (s: S, a: A) => any,
  wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
)
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents<S, A, PS, PA>(
  action: (UnknownArgsActionType<S, A>),
  wrapper?: (action: NormalAction<any, S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>,
  parentState?: PS,
  parentActions?: PA,
): any {
  if (!wrapper) {
    return action
  }
  const wrapped = (state: S, actions: A, parentState: PS, parentActions: PA) => {
    const nactions = (...args) => runAction(action(...args), state, actions)
    return wrapper(nactions, parentState, parentActions, state, actions)
  }
  return wrapped
}
/**
 * @deprecated Deprecated for `withParents`
 */
export const wrapActions = withParents

export type App<State, Actions> = (props: AppProps<State, Actions>) => any

export function app<State, Actions>(props: AppProps<State, Actions>) {
  // const appEvents = props.events || {}
  const appActions = {} as Actions
  const appSubscribe = props.subscribe || (_ => Cmd.none)
  const render = props.onRender || noop
  // const appMiddlewares = props.middlewares || []
  let [appState, cmd] = runAction(props.init(), void 0 as any as State, appActions) as [State, Cmd.CmdType<Actions>]
  init(appState, appActions, props.actions, [])
  cmd.forEach(sub => sub(appActions))
  appRender(appState)
  appSubscribe(appState).forEach(sub => sub(appActions))

  return {
    ...props,
    actions: appActions,
    get state() {
      return appState
    },
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
    return render(view)
  }

  function init(state, actions, from: ActionsType<State, Actions> | ActionType<any, State, Actions>, path: string[]) {
    for (const key in from) {
      if (/^_/.test(key)) {
        continue
      }
      const subFrom = from[key]
      if (isFn(subFrom)) {
        actions[key] = function(...msgData) {
          state = get(path, appState)
          // action = appMiddlewares.reduce((action, fn) => fn(action, key, path), action)
          let [nextState, nextAppState] = [state, appState]
          let cmd = Cmd.none
          let [parentState, parentActions] = [undefined, undefined]
          const actionResult = subFrom(...msgData)
          if (isFn(actionResult) && actionResult.length > 2) {
            const pPath = path.slice(0, -1)
            parentActions = get(pPath, appActions)
            parentState = get(pPath, appState)
          }
          [nextState, cmd] = runAction(
            actionResult,
            state,
            actions,
            parentState,
            parentActions
          )

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
      } else if (typeof subFrom === 'object' && subFrom) {
        init(
          state[key] || (state[key] = {}),
          (actions[key] = clone(subFrom)),
          subFrom,
          path.concat(key)
        )
      }
    }
  }
}

export default app
