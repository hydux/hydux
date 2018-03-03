import { App } from './../index';
export declare type Options = {
    remote?: boolean;
    hostname?: string;
    port?: number;
    secure?: boolean;
    getActionType?: (a: object) => any;
    debounce?: number;
    filter?: (action: string) => true;
    jsonToState?: (j: object) => any;
    stateToJson?: (s: object) => any;
};
export default function withDevtools<State, Actions>(options: any): (app: App<State, Actions>) => App<State, Actions>;
