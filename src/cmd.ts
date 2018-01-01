import { ActionResult, ActionType, ActionsType } from './types'
import { isFn } from './utils'
export interface Sub<Actions> {
  (actions: Actions): void
}
export type CmdType<Actions> = Sub<Actions>[]

function ofFn<A, T, State, Actions>(
  task: (args: A) => T,
  args: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

function ofFn<A, T, State, Actions>(
  task?: () => T,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

function ofFn<A, T, State, Actions>(
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
  return [
    _ => {
      try {
        let result = task(args)
        if (result && succeedAction) {
          succeedAction(result)
        }
      } catch (e) {
        failedAction && failedAction(e)
      }
    }
  ]
}

function ofPromise<A, T, State, Actions>(
  task: (arg: A) => Promise<T>,
  args: A,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

function ofPromise<A, T, State, Actions>(
  task?: () => Promise<T>,
  succeedAction?: ActionType<T, State, Actions>,
  failedAction?: ActionType<Error, State, Actions>
): CmdType<Actions>

function ofPromise<A, T, State, Actions>(
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
    _ => {
      task(args)
      .then(succeedAction)
      .catch(failedAction)
    }
  ]
}
export default {
  none: ([] as Array<Sub<any>>),
  ofPromise,
  ofFn,
  ofSub<Actions>(sub: Sub<Actions>): CmdType<Actions> {
    return [sub]
  },
  batch<State, Actions>(...cmds: (CmdType<Actions> | CmdType<Actions>[])[]): CmdType<Actions> {
    const _concat = Array.prototype.concat
    return _concat.apply([], _concat.apply([], cmds))
  },
  map<State, Actions, SubActions>(map: (action: Actions) => SubActions, cmd: CmdType<SubActions>): CmdType<Actions> {
    return cmd.map(sub => actions => sub(map(actions)))
  }
}
