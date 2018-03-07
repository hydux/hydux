import { ActionResult, ActionCmdResult, ActionsType } from './types';
import Cmd, { CmdType, Sub } from './cmd';
import { isFn, noop, isPojo } from './utils';
export * from './helpers';
export * from './types';
export { Cmd, CmdType, Sub, ActionResult, noop, isFn, isPojo };
export declare type Init<S, A> = () => S | [S, CmdType<A>];
export declare type View<S, A> = (state: S, actions: A) => any;
export declare type Subscribe<S, A> = (state: S) => CmdType<A>;
export declare type OnUpdate<S, A> = <M>(data: {
    prevAppState: S;
    nextAppState: S;
    msgData: M;
    action: string;
}) => void;
export declare type OnUpdateStart<S, A> = <M>(data: {
    action: string;
}) => void;
export interface AppProps<State, Actions> {
    init: Init<State, Actions>;
    view: View<State, Actions>;
    actions: ActionsType<State, Actions>;
    subscribe?: Subscribe<State, Actions>;
    onRender?: (view: any) => void;
    onUpdate?: OnUpdate<State, Actions>;
    onUpdateStart?: OnUpdateStart<State, Actions>;
}
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export declare function runAction<S, A, PS, PA>(result: ActionResult<S, A> | ((state: S, actions: A) => ActionResult<S, A>), state: S, actions: A, parentState?: PS, parentActions?: PA): ActionCmdResult<S, A>;
export declare function withParents<S, A, PS, PA, A1>(action: (a1: A1) => (s: S, a: A) => any, wrapper?: (action: (a1: A1) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): any;
export declare function withParents<S, A, PS, PA, A1, A2>(action: (a1: A1, a2: A2) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3>(action: (a1: A1, a2: A2, a3: A3) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3, A4>(action: (a1: A1, a2: A2, a3: A3, a4: A4) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3, A4, A5>(action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => ActionCmdResult<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionResult<S, A>, parentState?: PS, parentActions?: PA): any;
/**
 * @deprecated Deprecated for `withParents`
 */
export declare const wrapActions: typeof withParents;
export declare type App<State, Actions> = (props: AppProps<State, Actions>) => any;
export declare function app<State, Actions>(props: AppProps<State, Actions>): {
    actions: Actions;
    state: State;
    getState(): State;
    render: (state?: State) => any;
    init: Init<State, Actions>;
    view: View<State, Actions>;
    subscribe?: Subscribe<State, Actions> | undefined;
    onRender?: ((view: any) => void) | undefined;
    onUpdate?: OnUpdate<State, Actions> | undefined;
    onUpdateStart?: OnUpdateStart<State, Actions> | undefined;
};
export default app;
