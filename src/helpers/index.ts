import * as Cmd from '../cmd'
import { Init, normalize, Context, Component, CmdType } from '../index'
export * from './hash'
export * from './memoize'
import {
  set,
  merge,
  setDeep,
  setDeepMutable,
  get,
  isFn,
  noop,
  isPojo,
  clone,
  OverrideLength,
  weakVal,
} from '../utils'
import {
  ActionReturn,
  ActionState,
  ActionCmdReturn,
  StandardActionReturn,
  ActionType,
  ActionsType,
  InitObjReturn,
  GeneralActionType,
} from '../types'
import { dispatcher } from '../dispatcher'

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
 *      never(msg) // incomplete check from TS
 *      break
 * }
 * ```
 */
export function dt<T extends string, D = null>(tag: T, data: D = null as any) {
  return { tag, data } as Dt<T, D>
}

/** @public */
export const never = (f: never) => f

/** @public */
export function mkInit<S, A>(state: S, cmd: Cmd.CmdType<A> = Cmd.none): ActionCmdReturn<S, A> {
  return { state, cmd }
}

export type Fn1<T1, R> = (a1: T1) => R

/** @public */
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

/** @public */
export function defaults<T>(value: T | null | undefined, defaults: T): T {
  return value == null ? defaults : value
}

export interface CombinedComps<
  T extends { [k: string]: [Component, InitObjReturn<any, any>] },
  A extends { [k: string]: any }
> {
  /** Combined state object for child components */
  state: { [k in keyof T]: T[k][1]['state'] }
  /** Combined and mapped cmd object for child components */
  cmd: Cmd.Sub<A>[]
  /**
   * Splited mapped cmd object for child components, useful for router config, so you can call init cmd when each page routing.
   *
   */
  cmds: { [k in keyof T]: Cmd.Sub<A>[] }
  /** Combined action object for child components */
  actions: { [k in keyof T]: T[k][0]['actions'] }
  /** Combined view function for child components */
  views: { [k in keyof T]: T[k][0]['view'] }
  /**
   * helper function for render routes views, so you can do
   * `subComps.render('somePage', state, actions)` instead of
   * `SomePage.views(state.somePage, actions.somePage)` or
   * `<SomePage.views
   *    state={state.somePage}
   *    actions={actions.somePage}
   *  />`
   */
  render: <K extends Extract<keyof T, keyof S>, S>(
    k: K,
    state: S,
    actions: ActionsType<S, any>,
  ) => any
}

export function combine<
  T extends { [k: string]: [Component, InitObjReturn<any, any>] },
  A extends { [k: string]: any }
>(arg: T, _acts: A = null as any): CombinedComps<T, A> {
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
      let view = views[k]
      if (view.length === 1) {
        return (view as any)({ state: state[k], actions: actions[k] })
      } else {
        return view(state[k], actions[k])
      }
    },
  }
}
/**
 * @internal
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export function runAction<S, A>(
  result: ActionReturn<S, A> | ((state: S, actions: A) => ActionReturn<S, A>),
): StandardActionReturn<S, A> {
  let res: any = result
  let {
    state,
    actions,
    parentState,
    parentActions,
    _internals,
  } = dispatcher.getContext()
  isFn(res) &&
    (res = res.call(actions, state, actions, parentState, parentActions)) &&
    isFn(res) &&
    (res = res.call(actions, actions))
  if (res && (_internals.newState !== state || _internals.cmd.length)) {
    console.error(result)
    // throw new Error(`Actions with new inject api cannot return anything!`)
    let nres = normalize<S, A>(res, state)
    return {
      state: { ..._internals.newState, ...nres.state },
      cmd: _internals.cmd.concat(nres.cmd),
    }
  }
  // action can be a function that return a promise or undefined(callback)
  if (res) {
    return normalize<S, A>(res, state)
  }
  return {
    state: _internals.newState,
    cmd: _internals.cmd,
  }
}

/** @internal */
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
 * @internal
 * @deprecated Deprecated for `overrideAction`
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function withParents<S, A, PS, PA>(
  action: GeneralActionType<S, A>,
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
    const nactions = (...args) => runAction(action(...args))
    return wrapper(nactions, parentState, parentActions, state, actions)
  }
  return wrapped
}
/**
 * @deprecated Deprecated for `overrideAction`
 * @internal
 */
export const wrapActions = withParents

export function overrideAction<PS, PA, S, A, A1>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1) => any,
  wrapper?: (
    a1: A1,
  ) => (
    action: <S = any, A = any>(a1: A1) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1, a2: A2) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
  ) => (
    action: <S = any, A = any>(a1: A1, a2: A2) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2, A3>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1, a2: A2, a3: A3) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
    a3: A3,
  ) => (
    action: <S = any, A = any>(a1: A1, a2: A2, a3: A3) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
export function overrideAction<S, A, PS, PA, A1, A2, A3, A4>(
  parentActions: PA,
  getter: (_: PA) => (a1: A1, a2: A2, a3: A3, a4: A4) => any,
  wrapper?: (
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
  ) => (
    action: <S = any, A = any>(a1: A1, a2: A2, a3: A3, a4: A4) => StandardActionReturn<S, A>,
    parentState: PS,
    parentActions: PA,
    state: S,
    actions: A,
  ) => ActionReturn<S, A>,
)
/**
 * Wrap a child action with parentState, parentActions.
 * @internal
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export function overrideAction<S, A, PS, PA>(
  parentActions: PA,
  getter: (_: PA) => GeneralActionType<S, A>,
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
  const wrapped = (...args) => {
    const normalAction = (...args) => {
      let ret = runAction(action(...args))
      return ret
    }
    let ctx = dispatcher.getContext()
    return wrapper(...args)(normalAction, ctx.parentState, ctx.parentActions, ctx.state, ctx.actions)
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
  weakVal(wrapped, OverrideLength, keys.length)
  if (!replaced) {
    console.error(new Error(`Cannot find action in parentActions`), parentActions, getter)
  }

  return parentActions
}
