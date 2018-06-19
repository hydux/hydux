import { ActionReturn, ActionObjReturen, InitObjReturn, ActionsType, InitReturn } from './types';
import Cmd, { CmdType, Sub } from './cmd';
import { isFn, noop, isPojo } from './utils';
export * from './helpers';
export * from './types';
export { Cmd, CmdType, Sub, ActionReturn, noop, isFn, isPojo };
export declare type Init<S, A> = () => InitReturn<S, A>;
export declare type View<S, A> = ((state: S, actions: A) => any);
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
export declare type Patch = <S, A>(path: string | string[], component: Component<S, A>, reuseState?: boolean) => Promise<any>;
export interface AppProps<State, Actions> {
    init: Init<State, Actions>;
    view: View<State, Actions>;
    actions: ActionsType<State, Actions>;
    subscribe?: Subscribe<State, Actions>;
    onRender?: (view: any) => void;
    onUpdated?: OnUpdate<State, Actions>;
    onUpdateStart?: OnUpdateStart<State, Actions>;
    /**
     * Use mutable state, useful for high performance scenarios like graphics rendering, e.g. hydux-pixi
     */
    mutable?: boolean;
}
export interface Component<State, Actions> {
    init: Init<State, Actions>;
    view: View<State, Actions>;
    actions: ActionsType<State, Actions>;
}
export interface Context<State, Actions, RenderReturn = any> {
    actions: Actions;
    state: State;
    init: Init<State, Actions>;
    view: View<State, Actions>;
    subscribe?: Subscribe<State, Actions>;
    onRender?: ((view: any) => RenderReturn);
    onUpdated?: OnUpdate<State, Actions>;
    onUpdateStart?: OnUpdateStart<State, Actions>;
    /** Patch a component in runtime, used for code-splitting */
    patch: Patch;
    render(state?: State): RenderReturn;
}
export declare type App<State, Actions> = (props: AppProps<State, Actions>) => Context<State, Actions, any>;
export declare type Enhancer<S, A> = (app: App<S, A>) => App<S, A>;
export declare function normalize<S, A>(initResult: ActionReturn<S, A>, state: S): Required<ActionObjReturen<S, A>>;
export declare function normalize<S, A>(initResult: InitReturn<S, A>): Required<InitObjReturn<S, A>>;
export declare function runCmd<A>(cmd: CmdType<A>, actions: A): any[];
export declare function app<State, Actions>(props: AppProps<State, Actions>): Context<State, Actions>;
export default app;
