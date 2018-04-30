import { Location, Query, RoutesMeta, Routes } from './index';
export declare type HistoryProps = {
    basePath: string;
    initPath: string;
};
export declare function parsePath<P, Q extends Query>(path: string, tpls: string[]): Location<P, Q>;
export declare function matchPath<P>(pathname: string, fmt: string): P | null;
export declare abstract class BaseHistory {
    location: Location<any, any>;
    lastLocation: Location<any, any>;
    _routesMeta: RoutesMeta<any, any>;
    protected props: HistoryProps;
    protected _last: string[];
    protected listeners: ((path: string) => void)[];
    private _routes;
    private _routesTpls;
    constructor(props?: Partial<HistoryProps>);
    abstract realPath(path: string): string;
    abstract current(): string;
    abstract push(path: string): void;
    abstract replace(path: string): void;
    readonly last: string;
    listen: (listener: any) => number;
    go(delta: any): void;
    back(): void;
    forward(): void;
    parsePath(path: string): Location<any, any>;
    _setRoutes(routes: Routes<any, any>, routesMeta: RoutesMeta<any, any>): void;
    protected handleChange(path?: string): void;
    private _updateLocation(path?);
}
export interface HashHistoryProps extends HistoryProps {
    hash: string;
}
export declare class HashHistory extends BaseHistory {
    protected props: HashHistoryProps;
    constructor(props?: Partial<HashHistoryProps>);
    realPath(path: string): string;
    current(): string;
    push(path: any): void;
    replace(path: any): void;
}
export declare class BrowserHistory extends BaseHistory {
    constructor(props?: Partial<HistoryProps>);
    realPath(path: string): string;
    current(): string;
    push(path: any): void;
    replace(path: any): void;
}
export interface MemoryHistoryProps extends HistoryProps {
    initPath: string;
}
export declare class MemoryHistory extends BaseHistory {
    protected props: MemoryHistoryProps;
    private _stack;
    private _index;
    constructor(props?: Partial<MemoryHistoryProps>);
    realPath(path: string): string;
    current(): string;
    push(path: any): void;
    replace(path: any): void;
    go(delta: any): void;
    back(): void;
    forward(): void;
    private _reset();
}
