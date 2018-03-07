import { Location, Query } from './index';
export declare type HistoryProps = {
    basePath: string;
};
export declare abstract class BaseHistory {
    location: Location<any, any>;
    lastLocation: Location<any, any>;
    protected props: HistoryProps;
    protected _last: string[];
    protected listeners: ((path: string) => void)[];
    constructor(props?: Partial<HistoryProps>);
    last: () => string;
    abstract getRealPath(path: string): string;
    abstract current(): string;
    abstract push(path: string): void;
    abstract replace(path: string): void;
    listen: (listener: any) => number;
    go(delta: any): void;
    back(): void;
    forward(): void;
    _setLoc<P = any, Q extends Query = any>(loc: Location<P, Q>): void;
    protected handleChange(path?: string): void;
}
export interface HashHistoryProps extends HistoryProps {
    hash: string;
}
export declare class HashHistory extends BaseHistory {
    protected props: HashHistoryProps;
    constructor(props?: Partial<HashHistoryProps>);
    getRealPath(path: string): string;
    current(): string;
    push(path: any): void;
    replace(path: any): void;
}
export declare class BrowserHistory extends BaseHistory {
    constructor(props?: Partial<HistoryProps>);
    getRealPath(path: string): string;
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
    getRealPath(path: string): string;
    current(): string;
    push(path: any): void;
    replace(path: any): void;
    go(delta: any): void;
    back(): void;
    forward(): void;
    private _reset();
}
