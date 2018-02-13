import { App } from './../index';
export declare type Options = {
    store?: Storage;
    serialize?: (data: any) => string;
    deserialize?: (str: string) => any;
    debounce?: number;
    key?: string;
};
export default function withPersist<State, Actions>(props?: Options): (app: App<State, Actions>) => App<State, Actions>;
