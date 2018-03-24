import { ActionResult, ActionType, ActionsType } from './types'
import { isFn } from './utils'
export interface Sub<Actions> {
  (actions: Actions): any
}
export type CmdType<Actions> = Sub<Actions>[]
/**
 * Create command from a function has side effects.
 * @param task A function has one or zero paramter.
 * @param args Optional, the parameter of the funciton
 * @param succeedAction An action that would executed after the function executed.
 * @param failedAction An action that would executed after the function throw an error.
 */
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
/**
 * Create a command from promise
 * @param task A function that take one or zero parameter and return a promise.
 * @param args Optional, the paramter of task
 * @param succeedAction An action would execute when the promise fulfilled.
 * @param failedAction An action would execute when the promise rejected.
 */
export function ofPromise<A, T, State, Actions>(
  task: (arg: A) => Promise<T>,
  args: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

export function ofPromise<A, T, State, Actions>(
  task: () => Promise<T>,
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
/**
 * Create a command from a sub function, you can access all same level actions in a `sub`.
 * @param sub
 */
export const ofSub = <Actions>(sub: Sub<Actions>): CmdType<Actions> => [sub]
const _concat = Array.prototype.concat
/**
 * Batch multi commands to one command
 * @param cmds
 */
export const batch = <Actions>(
  ...cmds: (CmdType<any> | CmdType<any>[])[]
): CmdType<Actions> =>
  _concat.apply([], _concat.apply([], cmds))
/**
 * Map a command to a low level command
 * @param map
 * @param cmd
 */
export const map = <Actions, SubActions>(
  map: (action: Actions) => SubActions, cmd: CmdType<SubActions>
): CmdType<Actions> =>
  cmd.map(sub => actions => sub(map(actions)))
/**
 * Empty command
 */
export const none = ([] as Array<Sub<any>>)

export const Cmd = {
  none,
  ofFn,
  ofPromise,
  ofSub,
  batch,
  map,
}

export default Cmd
