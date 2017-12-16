export declare type HistoryProps = {
    basePath: string;
};
export declare abstract class BaseHistory {
    protected props: HistoryProps;
    protected _last: string[];
    protected listeners: ((path: string) => void)[];
    constructor(props?: Partial<HistoryProps>);
    last: () => string;
    abstract current(): string;
    abstract push(path: string): void;
    abstract replace(path: string): void;
    listen: (listener: any) => number;
    go: (delta: any) => void;
    back: () => void;
    forward: () => void;
    protected handleChange(path?: string): void;
}
export declare type HashHistoryProps = HistoryProps & {
    hash: string;
};
export declare class HashHistory extends BaseHistory {
    props: HashHistoryProps;
    constructor(props?: Partial<HashHistoryProps>);
    current(): string;
    push(path: any): void;
    replace(path: any): void;
}
export declare class BrowserHistory extends BaseHistory {
    constructor(props?: Partial<HistoryProps>);
    current(): string;
    push(path: any): void;
    replace(path: any): void;
}
