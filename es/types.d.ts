import { CmdType } from './cmd';
export declare type ActionState<State> = Partial<State> | null | void;
export interface ActionObjReturen<S, A> {
    state?: Partial<S>;
    cmd?: CmdType<A>;
}
export interface InitObjReturn<S, A> {
    state: S;
    cmd?: CmdType<A>;
}
export declare type InitReturn<S, A> = S | CmdType<A> | [S, CmdType<A>] | InitObjReturn<S, A>;
export declare type ActionCmdReturn<State, Actions> = [Partial<State>, CmdType<Actions>] | ActionObjReturen<State, Actions>;
export declare type StandardActionReturn<S, A> = Required<ActionObjReturen<S, A>>;
export declare type SAR<S, A> = StandardActionReturn<S, A>;
export declare type ActionReturn<State, Actions> = ActionCmdReturn<State, Actions> | ActionState<State> | CmdType<Actions>;
export declare type ActionType<Data, State, Actions> = (data: Data, ...args: any[]) => ActionReturn<State, Actions> | ((state: State, actions: Actions) => ActionReturn<State, Actions>);
export declare type ActionType2<D1, D2, State, Actions> = (data1: D1, data2: D2, ...args: any[]) => ActionReturn<State, Actions> | ((state: State, actions: Actions) => ActionReturn<State, Actions>);
export declare type UnknownArgsActionType<State, Actions> = (...args: any[]) => ActionReturn<State, Actions> | ((state: State, actions: Actions) => ActionReturn<State, Actions>);
/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export declare type ActionsType<State, Actions> = {
    [P in keyof Actions]: ActionType<any, State, Actions> | ActionsType<any, Actions[P]>;
};
export declare type AR<S, A> = ActionReturn<S, A>;
export declare type ACR<S, A> = ActionCmdReturn<S, A>;
