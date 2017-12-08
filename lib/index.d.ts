import { ActionsType } from './types';
import Cmd, { CmdType } from './cmd';
import { noop } from './utils';
export declare type Init<S, A> = () => S | [S, CmdType<S, A>];
export declare type View<S, A> = (appState: S) => ((actions: A) => any);
export declare type Subscribe<S, A> = (state: S) => CmdType<S, A>;
export declare type OnUpdate<S, A> = <M>(data: {
    prevAppState: S;
    nextAppState: S;
    msgData: M;
    action: string;
}) => void;
export { Cmd, noop };
export declare type AppProps<State, Actions> = {
    init: Init<State, Actions>;
    view: View<State, Actions>;
    actions: ActionsType<State, Actions>;
    subscribe?: Subscribe<State, Actions>;
    render?: (view: any) => void;
    onError?: (err: Error) => void;
    onUpdate?: OnUpdate<State, Actions>;
};
export declare type App<State, Actions> = (props: AppProps<State, Actions>) => any;
export default function app<State, Actions>(props: AppProps<State, Actions>): {
    actions: ActionsType<State, Actions>;
    getState(): State;
    render: (state: any) => void;
    init: Init<State, Actions>;
    view: View<State, Actions>;
    subscribe?: Subscribe<State, Actions> | undefined;
    onError?: ((err: Error) => void) | undefined;
    onUpdate?: OnUpdate<State, Actions> | undefined;
};
