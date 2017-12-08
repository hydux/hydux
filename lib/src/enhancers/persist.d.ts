import { App } from './../index';
export default function withPersist<State, Actions>({store, serialize, deserialize, debounce, key}?: {
    store?: Storage;
    serialize?: {
        (value: any, replacer?: ((key: string, value: any) => any) | undefined, space?: string | number | undefined): string;
        (value: any, replacer?: (string | number)[] | null | undefined, space?: string | number | undefined): string;
    };
    deserialize?: (text: string, reviver?: ((key: any, value: any) => any) | undefined) => any;
    debounce?: number;
    key?: string;
}): (app: App<State, Actions>) => App<State, Actions>;
