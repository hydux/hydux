import { CmdType } from './cmd'

export type ActionState<State> = Partial<State> | null | void
export type ActionStateWithCmd<State, Actions> = [ActionState<State>, CmdType<State, Actions>]
export type ActionResult<State, Actions> = ActionState<State> | ActionStateWithCmd<State, Actions>
export type MyAction<Data, State, Actions> = (
  data: Data
) =>
  | ((state: State) => ActionResult<State, Actions>)
  | ((state: State) => ((actions: Actions) => ActionResult<State, Actions>))
  | ActionResult<State, Actions>

/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export type MyActions<State, Actions> = {
  [P in keyof Actions]: MyAction<any, State, Actions> | MyActions<any, Actions[P]>
}
