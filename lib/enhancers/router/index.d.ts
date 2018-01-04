import { ActionType } from './../../types';
import { AppProps, App, View, OnUpdate } from './../../index';
import { HistoryProps, BaseHistory, HashHistory, BrowserHistory } from './history';
export { HistoryProps, BaseHistory, HashHistory, BrowserHistory };
export interface Query {
    [key: string]: string | string[];
}
export interface Location<P, Q extends Query> {
    template: string | null;
    pathname: string;
    params: P;
    query: Q;
    search: string;
}
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
export declare function mkLink(history: History, h: any): ({to, onClick, replace, ...props}: {
    to: string;
    onClick?: ((e: MouseEvent) => void) | undefined;
    replace?: boolean | undefined;
}, children: any) => JSX.Element;
export declare type Routes<State, Actions> = {
    [key: string]: ActionType<Location<any, any>, State, Actions>;
};
export interface RouterAppProps<State, Actions> extends AppProps<State, Actions> {
    view: View<RouterState<State>, RouterActions<Actions>>;
    onUpdate?: OnUpdate<RouterState<State>, RouterActions<Actions>>;
}
export default function withRouter<State, Actions>(props?: {
    history?: BaseHistory;
    routes?: Routes<State, Actions>;
}): (app: App<State, Actions>) => (props: RouterAppProps<State, Actions>) => any;
export interface NestedRoutes<State, Actions> {
    path: string;
    label?: string;
    action?: ActionType<Location<any, any>, State, Actions>;
    children?: NestedRoutes<State, Actions>[];
}
export interface RouteInfo<State, Actions> {
    path: string;
    label?: string;
    action?: ActionType<Location<any, any>, State, Actions>;
}
export interface RouteMeta<State, Actions> {
    path: string;
    label?: string;
    action?: ActionType<Location<any, any>, State, Actions>;
    parents: RouteInfo<State, Actions>[];
    children: RouteInfo<State, Actions>[];
}
export interface RoutesMeta<State, Actions> {
    [key: string]: RouteMeta<State, Actions>;
}
export declare function join(...args: string[]): string;
/**
 * @param routes nested routes contains path, action, children, it would parse it to a `route` field (path:action map) for router enhancer, and a `meta` field which contains each route's parents.
 */
export declare function parseNestedRoutes<State, Actions>(routes: NestedRoutes<State, Actions>): {
    routes: Routes<State, Actions>;
    meta: RoutesMeta<State, Actions>;
};
