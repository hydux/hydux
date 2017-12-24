import { ActionResult, ActionType, ActionsType } from './types'

export interface Sub<Actions> {
  (actions: Actions): void
}
export type CmdType<Actions> = Sub<Actions>[]

export default {
  none: ([] as Array<Sub<any>>),
  ofPromise<A, T, State, Actions>(
    task: (args: A) => Promise<T>,
    args: A,
    succeedAction?: ActionType<T, State, Actions>,
    failedAction?: ActionType<Error, State, Actions>
  ): CmdType<Actions> {
    return [
      _ => {
        task(args)
        .then(succeedAction)
        .catch(failedAction)
      }
    ]
  },
  ofFn<A, T, State, Actions>(
    task: (args: A) => T | void,
    args: A,
    succeedAction?: ActionType<T, State, Actions>,
    failedAction?: ActionType<Error, State, Actions>
  ): CmdType<Actions> {
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
  },
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
