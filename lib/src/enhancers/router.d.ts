import { ActionType } from './../types';
import { AppProps, App } from './../index';
import { CmdType } from './../cmd';
export declare type MyAppProps<State, Actions> = AppProps<State, Actions> & {
    init: (page: any) => State | [State, CmdType<State, Actions>];
};
export declare type Router<P, Q> = {
    template: string;
    pathname: string;
    params: P;
    query: Q;
    search: string;
};
export declare type HistoryProps = {
    basePath: string;
};
export declare class BaseHistory {
    protected props: HistoryProps;
    protected _last: string[];
    protected listeners: ((path: string) => void)[];
    constructor(props?: HistoryProps);
    last: () => string;
    current: () => string;
    watch: (listener: any) => number;
    go: (delta: any) => void;
    back: () => void;
    forward: () => void;
    protected handleChange(path?: string): void;
}
export declare class HashHistory extends BaseHistory {
    constructor(props: any);
    current: () => string;
    assign(path: any): void;
    replace(path: any): void;
}
export declare class BrowserHistory extends BaseHistory {
    constructor(props: any);
    current: () => string;
    assign(path: any): void;
    replace(path: any): void;
}
export declare type ActionsWithRoutes<Actions extends Object, RouterActions> = Actions & {
    routes: RouterActions;
    location: BaseHistory;
};
export default function withRouter<State, Actions, RouterActions>({type, basePath, routes}?: {
    type?: 'hash' | 'history';
    basePath?: string;
    routes?: {
        [key: string]: (actions: RouterActions) => ActionType<Router<any, any>, State, ActionsWithRoutes<Actions, RouterActions>>;
    };
}): (app: App<State, ActionsWithRoutes<Actions, RouterActions>>) => App<State, ActionsWithRoutes<Actions, RouterActions>>;
export declare function nestedRoutes(routes: any): void;
