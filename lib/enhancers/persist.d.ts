import { App } from './../index';
export default function withPersist<State, Actions>(props?: {
    store?: Storage;
    serialize?: (data: any) => string;
    deserialize?: (str: string) => any;
    debounce?: number;
    key?: string;
}): (app: App<State, Actions>) => App<State, Actions>;
