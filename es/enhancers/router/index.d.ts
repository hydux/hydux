import { ActionType, ActionType2 } from './../../types';
import { AppProps, App, View, OnUpdate, Context, Patch, Component } from './../../index';
import { Dt } from '../../helpers';
import { HistoryProps, BaseHistory, HashHistory, BrowserHistory, MemoryHistory, MemoryHistoryProps, parsePath, matchPath } from './history';
export { parsePath, matchPath };
export { HistoryProps, BaseHistory, HashHistory, BrowserHistory, MemoryHistory, MemoryHistoryProps, Context, };
export interface Param {
    [key: string]: string;
}
export interface Query {
    [key: string]: string | string[];
}
export interface Location<P extends Param = Param, Q extends Query = Query> {
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
export declare type RouterActions<Actions extends Object> = Actions & {
    history: History;
};
export declare type RouterState<State extends Object, LazyComps = any> = State & {
    location: Location;
    lazyComps: LazyComps;
};
export interface LinkProps {
    to: string;
    onClick?: (e: any) => void;
    replace?: boolean;
    /** Prefetch splitted components, this will work only if you add code splitting first. */
    prefetch?: boolean;
    onMouseOver?: (e: any) => void;
    onMouseOut?: (e: any) => void;
    onTouchStart?: (e: any) => void;
    className?: string;
    onTouchEnd?: (e: any) => void;
    onTouchMove?: (e: any) => void;
}
export declare function mkLink(history: History, h: any): ({ to, onClick, replace, prefetch, ...props }: LinkProps, children?: any) => JSX.Element;
export declare type Routes<State, Actions> = {
    [key: string]: ActionType2<Location<any, any>, Patch, State, Actions>;
};
export interface RouterAppProps<State, Actions> extends AppProps<State, Actions> {
    view: View<RouterState<State>, RouterActions<Actions>>;
    onUpdated?: OnUpdate<RouterState<State>, RouterActions<Actions>>;
}
export declare type Options<S, A> = {
    history?: BaseHistory;
    /** Whether is running in SSR mode, used for code-splitting */
    ssr?: boolean;
    /** Whether is running in the server side, if `ssr` is true, used for code-splitting */
    isServer?: boolean;
    routes: Routes<S, A> | NestedRoutes<S, A>;
};
export default function withRouter<State, Actions>(props?: Options<State, Actions>): (app: App<State, Actions>) => (props: RouterAppProps<State, Actions>) => Context<State, Actions, any>;
export declare type RouteComp<S, A> = Dt<'dynamic', {
    key: string;
    comp: Promise<Component<S, A>>;
}> | Dt<'clientSSR', {
    key: string;
    comp: Promise<Component<S, A>>;
}> | Dt<'normal', null>;
export declare type GetComp<S, A> = () => [string /** key */, Promise<Component<S, A>>] | [string /** key */, Promise<Component<S, A>>, boolean /** whether rendering on the server side, default is true */];
export interface NestedRoutes<State, Actions> {
    path: string;
    label?: string;
    action?: ActionType<Location<any, any>, State, Actions>;
    children?: NestedRoutes<any, any>[];
    /**
     * Get a dynamic component, you need to return the key and the promise of the component, if you setup SSR, it would automatically rendered in the server side, but you can return a third boolean value to indicate whether rendering on the server side.
     * e.g.
     *  () =>
     *   | [string /** key *\/, Promise<Component<S, A>>]
     *   | [string /** key *\/, Promise<Component<S, A>>, boolean /** false to disable rendering on the server side *\/]
     */
    getComponent?: GetComp<State, Actions>;
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
    getComponent?: GetComp<State, Actions>;
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
