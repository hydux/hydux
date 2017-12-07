import { CmdType } from './cmd'
import { ActionResult, MyAction, MyActions } from './types'

export type Sub<State, Actions> = (actions: MyActions<State, Actions>) => void | null
export type CmdType<State, Actions> = Sub<State, Actions>[]
export default {
  none: ([] as Array<Sub<any, any>>),
  ofPromise<A, T, State, Actions>(task: (args: A) => Promise<T>, args: A, succeedAction: MyAction<T, State, Actions>, failedAction: MyAction<Error, State, Actions>): CmdType<State, Actions> {
    return [
      _ => {
        task(args)
        .then(succeedAction)
        .catch(failedAction)
      }
    ]
  },
  ofFn<A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction: MyAction<T, State, Actions>, failedAction: MyAction<Error, State, Actions>): CmdType<State, Actions> {
    return [
      _ => {
        try {
          succeedAction(task(args))
        } catch (e) {
          failedAction(e)
        }
      }
    ]
  },
  ofSub<State, Actions>(sub: Sub<State, Actions>) {
    return [sub]
  },
  batch<State, Actions>(...cmds: CmdType<State, Actions>[]) {
    return Array.prototype.concat.apply([], cmds)
  },
  map<State, Actions, SubActions>(map: (action: MyActions<State, Actions>) => MyActions<State, SubActions>, cmd: CmdType<State, SubActions>): CmdType<State, Actions> {
    return cmd.map(sub => actions => sub(map(actions)))
  }
}
