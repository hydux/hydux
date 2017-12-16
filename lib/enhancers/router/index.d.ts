import { ActionType, ActionsType } from './../../types';
import { AppProps, App, Init, View, Subscribe, OnUpdate } from './../../index';
import { HistoryProps, BaseHistory, HashHistory, BrowserHistory } from './history';
export { HistoryProps, BaseHistory, HashHistory, BrowserHistory };
export declare type Query = {
    [key: string]: string | string[];
};
export declare type Location<P, Q extends Query> = {
    template: string | null;
    pathname: string;
    params: P;
    query: Q;
    search: string;
};
export interface History {
    push: (path: string) => void;
    replace: (path: string) => void;
    go: (delta: number) => void;
    back: () => void;
    forward: () => void;
}
export declare function parsePath<P, Q extends Query>(path: string): Location<P, Q>;
export declare function matchPath(pathname: string, fmt: string): {}[];
export declare type RouterActions<Actions extends Object> = Actions & {
    history: History;
};
export declare type RouterState<State extends Object> = State & {
    location: Location<any, any>;
};
export declare function mkLink(history: History, h: any): (props: any, children: any) => JSX.Element;
export declare type Routes<State, Actions> = {
    [key: string]: ActionType<Location<any, any>, State, Actions>;
};
export declare type AppProps<State, Actions> = {
    init: Init<State, Actions>;
    view: View<State, RouterActions<Actions>>;
    actions: ActionsType<State, Actions>;
    subscribe?: Subscribe<RouterState<State>, RouterActions<Actions>>;
    onRender?: (view: any) => void;
    onError?: (err: Error) => void;
    onUpdate?: OnUpdate<RouterState<State>, RouterActions<Actions>>;
};
export default function withRouter<State, Actions>({history, routes}?: {
    history?: BaseHistory;
    routes?: Routes<State, Actions>;
}): (app: App<State, Actions>) => (props: AppProps<State, Actions>) => any;
export declare type NestedRoutes<Actions> = {
    path: string;
    label?: string;
    action?: <T>(loc: Location<any, any>) => (actions: Actions) => void;
    parents?: NestedRoutes<Actions>[];
    children: NestedRoutes<Actions>[];
};
export declare function nestedRoutes<Actions>(routes: NestedRoutes<Actions>): {
    [key: string]: NestedRoutes<Actions>;
};
