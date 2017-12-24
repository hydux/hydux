import { CmdType } from './cmd'

export type ActionState<State> = Partial<State> | null | void

export type ActionCmdResult<State, Actions> = [ActionState<State>, CmdType<Actions>]

export type ActionResult<State, Actions> = ActionState<State> | Promise<any> | ActionCmdResult<State, Actions>

export type ActionType<Data, State, Actions> = (
  data: Data
) =>
  | ((state: State) => ActionResult<State, Actions>)
  | ((state: State) => ((actions: Actions) => ActionResult<State, Actions>))
  | ActionResult<State, Actions>

/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]: ActionType<any, State, Actions> | ActionsType<any, Actions[P]>
}
