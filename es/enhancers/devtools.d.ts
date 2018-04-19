import { App } from './../index';
export declare type Options<State> = {
    remote?: boolean;
    hostname?: string;
    port?: number;
    secure?: boolean;
    getActionType?: (a: object) => any;
    debounce?: number;
    filter?: (action: string) => true;
    jsonToState?: (j: object) => State;
    stateToJson?: (s: State) => object;
};
export default function withDevtools<State, Actions>(_options: Options<State>): (app: App<State, Actions>) => App<State, Actions>;
