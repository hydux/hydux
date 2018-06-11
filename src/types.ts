import { CmdType } from './cmd'

export type ActionState<State> = Partial<State> | null | void

export type ActionObjResult<S, A> = { state: Partial<S>, cmd?: CmdType<A> }
export type ActionCmdResult<State, Actions> = [Partial<State>, CmdType<Actions>] | ActionObjResult<State, Actions>

export type NormalActionResult<S, A> = Required<ActionObjResult<S, A>>

export type ActionResult<State, Actions> = ActionCmdResult<State, Actions> | ActionState<State> | Promise<any>

export type ActionType<Data, State, Actions> =
  (data: Data, ...args: any[]) =>
  | ActionResult<State, Actions>
  | ((state: State, actions: Actions) => ActionResult<State, Actions>)

export type ActionType2<D1, D2, State, Actions> =
  (data1: D1, data2: D2, ...args: any[]) =>
  | ActionResult<State, Actions>
  | ((state: State, actions: Actions) => ActionResult<State, Actions>)

export type UnknownArgsActionType<State, Actions> =
  (...args: any[]) =>
  | ActionResult<State, Actions>
  | ((state: State, actions: Actions) => ActionResult<State, Actions>)

/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]: ActionType<any, State, Actions> | ActionsType<any, Actions[P]>
}

export type AR<S, A> = ActionResult<S, A>
export type ACR<S, A> = ActionCmdResult<S, A>
