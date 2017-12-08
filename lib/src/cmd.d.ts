import { ActionType, ActionsType } from './types';
export declare type Sub<State, Actions> = (actions: ActionsType<State, Actions>) => void | null;
export declare type CmdType<State, Actions> = Sub<State, Actions>[];
declare const _default: {
    none: Sub<any, any>[];
    ofPromise<A, T, State, Actions>(task: (args: A) => Promise<T>, args: A, succeedAction: ActionType<T, State, Actions>, failedAction: ActionType<Error, State, Actions>): Sub<State, Actions>[];
    ofFn<A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction: ActionType<T, State, Actions>, failedAction: ActionType<Error, State, Actions>): Sub<State, Actions>[];
    ofSub<State, Actions>(sub: Sub<State, Actions>): Sub<State, Actions>[];
    batch<State, Actions>(...cmds: Sub<State, Actions>[][]): any;
    map<State, Actions, SubActions>(map: (action: ActionsType<State, Actions>) => ActionsType<State, SubActions>, cmd: Sub<State, SubActions>[]): Sub<State, Actions>[];
};
export default _default;
