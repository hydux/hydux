import { CmdType } from './cmd'

export type ActionState<State> = Partial<State> | null | void

export interface ActionObjReturen<S, A> {
  state?: Partial<S>
  cmd?: CmdType<A>
}
export interface InitObjReturn<S, A> {
  state: S
  cmd?: CmdType<A>
}
export type InitReturn<S, A> = S | CmdType<A> | [S, CmdType<A>] | InitObjReturn<S, A>

export type ActionCmdReturn<State, Actions> = [Partial<State>, CmdType<Actions>] | ActionObjReturen<State, Actions>

export type StandardActionReturn<S, A> = Required<ActionObjReturen<S, A>>
export type SAR<S, A> = StandardActionReturn<S, A>

export type ActionReturn<State, Actions> = ActionCmdReturn<State, Actions> | ActionState<State> | CmdType<Actions>

export type ActionType<Data, State, Actions> =
  (data: Data, ...args: any[]) =>
  | ActionReturn<State, Actions>
  | ((state: State, actions: Actions) => ActionReturn<State, Actions>)

export type ActionType2<D1, D2, State, Actions> =
  (data1: D1, data2: D2, ...args: any[]) =>
  | ActionReturn<State, Actions>
  | ((state: State, actions: Actions) => ActionReturn<State, Actions>)

export type UnknownArgsActionType<State, Actions> =
  (...args: any[]) =>
  | ActionReturn<State, Actions>
  | ((state: State, actions: Actions) => ActionReturn<State, Actions>)

/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]: ActionType<any, State, Actions> | ActionsType<any, Actions[P]>
}

export type AR<S, A> = ActionReturn<S, A>
export type ACR<S, A> = ActionCmdReturn<S, A>
