import { ActionResult, ActionType, ActionsType } from './types'
import { isFn } from './utils'
export interface Sub<Actions> {
  (actions: Actions): any
}
export type CmdType<Actions> = Sub<Actions>[]

export function ofFn<A, T, State, Actions>(
  task: (args: A) => T,
  args: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

export function ofFn<A, T, State, Actions>(
  task?: () => T,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

export function ofFn<A, T, State, Actions>(
  task?: (args?: A) => T,
  args?: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions> {
  if (!task) {
    return [] as CmdType<Actions>
  }
  if (isFn(args)) {
    failedAction = succeedAction as any
    succeedAction = args as any
    args = void 0
  }
  const fn = () => {
    const result = task(args)
    if (succeedAction) {
      succeedAction(result)
    }
    return result
  }
  return [
    _ => {
      if (failedAction) {
        try {
          return fn()
        } catch (e) {
          console.error(e)
          failedAction(e)
        }
      } else { // don't wrap in try cache, get better DX in `Pause on exceptions`
        return fn()
      }
    }
  ]
}

export function ofPromise<A, T, State, Actions>(
  task: (arg: A) => Promise<T>,
  args: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

export function ofPromise<A, T, State, Actions>(
  task?: () => Promise<T>,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

export function ofPromise<A, T, State, Actions>(
  task: (args?: A) => Promise<T>,
  args?: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions> {
  if (!task) {
    return [] as CmdType<Actions>
  }
  if (isFn(args)) {
    failedAction = succeedAction as any
    succeedAction = args as any
    args = void 0
  }
  return [
    _ =>
      task(args)
        .then(res => {
          try {
            succeedAction && succeedAction(res)
          } catch (error) {
            console.error(error)
          }
        })
        .catch(failedAction)
  ]
}
export const ofSub = <Actions>(sub: Sub<Actions>): CmdType<Actions> => [sub]
const _concat = Array.prototype.concat
export const batch = <Actions>(...cmds: (CmdType<any> | CmdType<any>[])[]): CmdType<Actions> => _concat.apply([], _concat.apply([], cmds))
export const map = <Actions, SubActions>(map: (action: Actions) => SubActions, cmd: CmdType<SubActions>): CmdType<Actions> => {
  return cmd.map(sub => actions => sub(map(actions)))
}
export const none = ([] as Array<Sub<any>>)

export default {
  none,
  ofFn,
  ofPromise,
  ofSub,
  batch,
  map,
}
