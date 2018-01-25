import { ActionResult, ActionState, ActionCmdResult, ActionType, ActionsType, UnknownArgsActionType, NormalAction, NormalActionCmdResult } from './types';
import Cmd, { CmdType, Sub } from './cmd';
import { noop } from './utils';
export { CmdType, Sub, ActionResult, ActionState, ActionCmdResult, ActionType, ActionsType, UnknownArgsActionType };
export declare type Init<S, A> = () => S | [S, CmdType<A>];
export declare type View<S, A> = (state: S, actions: A) => any;
export declare type Subscribe<S, A> = (state: S) => CmdType<A>;
export declare type OnUpdate<S, A> = <M>(data: {
    prevAppState: S;
    nextAppState: S;
    msgData: M;
    action: string;
}) => void;
export { Cmd, noop };
export interface AppProps<State, Actions> {
    init: Init<State, Actions>;
    view: View<State, Actions>;
    actions: ActionsType<State, Actions>;
    subscribe?: Subscribe<State, Actions>;
    onRender?: (view: any) => void;
    onUpdate?: OnUpdate<State, Actions>;
}
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export declare function runAction<S, A, PS, PA>(result: ActionResult<S, A> | ((state: S, actions: A) => ActionResult<S, A>), state: S, actions: A, parentState?: PS, parentActions?: PA): NormalActionCmdResult<S, A>;
/**
 * Wrap a child action with parentState, parentActions.
 * @param action The action to be wrapped
 * @param wrapper
 * @param parentState
 * @param parentActions
 */
export declare function wrapAction<S, A, PS, PA>(action: UnknownArgsActionType<S, A>, wrapper: (action: NormalAction<any, S, A>, parentState: PS, parentActions: PA) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): (state: S, actions: A, parentState: PS, parentActions: PA) => ActionResult<S, A>;
export declare type App<State, Actions> = (props: AppProps<State, Actions>) => any;
export default function app<State, Actions>(props: AppProps<State, Actions>): {
    actions: Actions;
    state: State;
    getState(): State;
    render: (state?: State) => any;
    init: Init<State, Actions>;
    view: View<State, Actions>;
    subscribe?: Subscribe<State, Actions> | undefined;
    onRender?: ((view: any) => void) | undefined;
    onUpdate?: OnUpdate<State, Actions> | undefined;
};
