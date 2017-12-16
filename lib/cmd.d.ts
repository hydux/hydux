import { ActionType } from './types';
export interface Sub<State, Actions> {
    (actions: Actions): void;
}
export declare type CmdType<State, Actions> = Sub<State, Actions>[];
declare const _default: {
    none: Sub<any, any>[];
    ofPromise<A, T, State, Actions>(task: (args: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<State, Actions>[];
    ofFn<A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction: ActionType<T, State, Actions>, failedAction: ActionType<Error, State, Actions>): Sub<State, Actions>[];
    ofSub<State, Actions>(sub: Sub<State, Actions>): Sub<State, Actions>[];
    batch<State, Actions>(...cmds: (Sub<State, Actions>[] | Sub<State, Actions>[][])[]): Sub<State, Actions>[];
    map<State, Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<State, SubActions>[]): Sub<State, Actions>[];
};
export default _default;
