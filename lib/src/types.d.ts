import { CmdType } from './cmd';
export declare type ActionState<State> = Partial<State> | null | void;
export declare type ActionStateWithCmd<State, Actions> = [ActionState<State>, CmdType<State, Actions>];
export declare type ActionResult<State, Actions> = ActionState<State> | ActionStateWithCmd<State, Actions>;
export declare type ActionType<Data, State, Actions> = (data: Data) => ((state: State) => ActionResult<State, Actions>) | ((state: State) => ((actions: Actions) => ActionResult<State, Actions>)) | ActionResult<State, Actions>;
/** The interface for actions (exposed when implementing actions).
 *
 * @memberOf [App]
 */
export declare type ActionsType<State, Actions> = {
    [P in keyof Actions]: ActionType<any, State, Actions> | ActionsType<any, Actions[P]>;
};
