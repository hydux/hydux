import * as Cmd from '../cmd'
import { Init, normalize, Context, Component } from '../index'
export * from './hash'
export * from './memoize'
import { set, merge, setDeep, setDeepMutable, get, isFn, noop, isPojo, clone } from '../utils'
import {
  ActionReturn,
  ActionState,
  ActionCmdReturn,
  StandardActionReturn,
  ActionType,
  ActionsType,
  InitObjReturn,
  UnknownArgsActionType,
} from '../types'
export type Dt<T extends string, D = null> = {
  tag: T
  data: D
} & { __tsTag: 'DateType' }

/**
 * ADT Helper for TS
 * e.g.
 * ```ts
 * type Msg =
 * | Dt<'fetchBook', number>
 * | Dt<'updateBook', Book>
 *
 * let msg = dt('fetchBook', 1)
 * switch(msg.tag) {
 *   case 'fetchBook':
 *      //...
 *      break
 *   case 'updateBook':
 *      //...
 *      break
 *   default:
 *      never(msg.tag) // incomplete check from TS
 *      break
 * }
 * ```
 */
export function dt<T extends string, D = null>(tag: T, data: D = null as any) {
  return { tag, data } as Dt<T, D>
}

export const never = (f: never) => f

export function mkInit<S, A>(state: S, cmd: Cmd.CmdType<A> = Cmd.none): ActionCmdReturn<S, A> {
  return { state, cmd }
}

export type Fn1<T1, R> = (a1: T1) => R

export function compose<T1, T2, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, R>): Fn1<T1, R>
export function compose<T1, T2, T3, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, T5, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, T5>,
  fn5: Fn1<T5, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, T5, T6, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, T5>,
  fn5: Fn1<T5, T6>,
  fn6: Fn1<T6, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, T5, T6, T7, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, T5>,
  fn5: Fn1<T5, T6>,
  fn6: Fn1<T6, T7>,
  fn7: Fn1<T7, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, T5, T6, T7, T8, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, T5>,
  fn5: Fn1<T5, T6>,
  fn6: Fn1<T6, T7>,
  fn7: Fn1<T7, T8>,
  fn8: Fn1<T8, R>,
): Fn1<T1, R>
export function compose<T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(
  fn1: Fn1<T1, T2>,
  fn2: Fn1<T2, T3>,
  fn3: Fn1<T3, T4>,
  fn4: Fn1<T4, T5>,
  fn5: Fn1<T5, T6>,
  fn6: Fn1<T6, T7>,
  fn7: Fn1<T7, T8>,
  fn8: Fn1<T8, T9>,
  fn9: Fn1<T9, R>,
): Fn1<T1, R>
export function compose<R>(...fns: Function[]): Fn1<any, R> {
  return arg => fns.reduce((arg, fn) => fn(arg), arg)
}

export interface CombinedComps<
  T extends { [k: string]: [Component, InitObjReturn<any, any>] },
  A extends { [k: string]: any }
> {
  state: { [k in keyof T]: T[k][1]['state'] }
  cmd: Cmd.Sub<A>[]
  cmds: { [k in keyof T]: Cmd.Sub<A>[] }
  actions: { [k in keyof T]: T[k][0]['actions'] }
  views: { [k in keyof T]: T[k][0]['view'] }
  render: <K extends Extract<keyof T, keyof S>, S>(k: K, state: S, actions: ActionsType<S, any>) => any
}

export function combine<
  T extends { [k: string]: [Component, InitObjReturn<any, any>] },
  A extends { [k: string]: any }
>(arg: T): CombinedComps<T, A> {
  let state = {} as { [k in keyof T]: T[k][1]['state'] }
  let cmd = Cmd.none as Cmd.CmdType<A>
  let cmds = {} as { [k in keyof T]: Cmd.CmdType<A> }
  let actions = {} as { [k in keyof T]: T[k][0]['actions'] }
  let views = {} as { [k in keyof T]: T[k][0]['view'] }
  for (const key in arg) {
    let comp = arg[key][0]
    let init = normalize<any, any>(arg[key][1])
    state[key] = init.state
    actions[key] = comp.actions
    views[key] = comp.view
    cmds[key] = Cmd.map(_ => _[key], init.cmd)
    cmd = Cmd.batch(cmd, cmds[key])
  }
  return {
    state,
    cmd,
    cmds,
    views,
    actions,
    render(k, state, actions) {
      return views[k](state[k], actions[k])
    }
  }
}

/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction<S, A, PS, PA>(
  result: ActionReturn<S, A> | ((state: S, actions: A) => ActionReturn<S, A>),
  state: S,
  actions: A,
  parentState?: PS,
  parentActions?: PA,
): Required<StandardActionReturn<S, A>> {
  let res: any = result
  isFn(res) &&
    (res = res(state, actions, parentState, parentActions)) &&
    isFn(res) &&
    (res = res(actions))
  // action can be a function that return a promise or undefined(callback)
  if (res === undefined || (res.then && isFn(res.then))) {
    return { state, cmd: Cmd.none }
  }
  let ret2 = normalize(res as ActionReturn<S, A>, state)
  return {
    state: ret2.state || state,
    cmd: ret2.cmd,
  }
}

export function withParents<S, A, PS, PA, A1>(
  action: (a1: A1) => (s: S, a: A) => any,
  wrapper?: (
    action: (a1: A1) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function withParents<S, A, PS, PA, A1, A2>(
  action: (a1: A1, a2: A2) => (s: S, a: A) => any,
  wrapper?: (
    action: (a1: A1, a2: A2) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function withParents<S, A, PS, PA, A1, A2, A3>(
  action: (a1: A1, a2: A2, a3: A3) => (s: S, a: A) => any,
  wrapper?: (
    action: (a1: A1, a2: A2, a3: A3) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function withParents<S, A, PS, PA, A1, A2, A3, A4>(
  action: (a1: A1, a2: A2, a3: A3, a4: A4) => (s: S, a: A) => any,
  wrapper?: (
    action: (a1: A1, a2: A2, a3: A3, a4: A4) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function withParents<S, A, PS, PA, A1, A2, A3, A4, A5>(
  action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => (s: S, a: A) => any,
  wrapper?: (
    action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
/**
 * Wrap a child action with parentState, parentActions.
 * @deprecated Deprecated for `overrideAction`
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents<S, A, PS, PA>(
  action: UnknownArgsActionType<S, A>,
  wrapper?: (
    action: (...args) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
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
 * @deprecated Deprecated for `overrideAction`
 */
export const wrapActions = withParents

export function overrideAction<PS, PA, S, A, A1>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1) => (s: S, a: A) => any,
  wrapper?: (
    a1: A1,
  ) => (
    action: (a1: A1) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1) => (s: S, a: A) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
  ) => (
    action: (a1: A1, a2: A2) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2, A3>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1) => (s: S, a: A) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
    a3: A3,
  ) => (
    action: (a1: A1, a2: A2, a3: A3) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2, A3, A4>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1) => (s: S, a: A) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
  ) => (
    action: (a1: A1, a2: A2, a3: A3, a4: A4) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function overrideAction<S, A, PS, PA>(
  parentActions: PA,
  getter: (_: PA) => UnknownArgsActionType<S, A>,
  wrapper?: (
    ...args
  ) => (
    action: (...args) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
): any {
  if (!wrapper) {
    return parentActions
  }
  let action = getter(parentActions)
  const wrapped = (...args) => (state: S, actions: A, parentState: PS, parentActions: PA) => {
    const normalAction = (...args) => runAction(action(...args), state, actions)
    return wrapper(...args)(normalAction, parentState, parentActions, state, actions)
  }
  let keys = (getter.toString().match(/((?:[\w_$]+\.)+[\w_$]+)/) || [])[1].split('.').slice(1)
  let cursor = parentActions
  let replaced = false
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (cursor[key] === action) {
      cursor[key] = wrapped
      replaced = true
      break
    }
    cursor = cursor[key] = { ...cursor[key] }
  }
  if (!replaced) {
    console.error(new Error(`Cannot find action in parentActions`), parentActions, getter)
  }
  return parentActions
}
