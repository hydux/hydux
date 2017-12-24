import { ActionType } from './types';
export interface Sub<Actions> {
    (actions: Actions): void;
}
export declare type CmdType<Actions> = Sub<Actions>[];
declare const _default: {
    none: Sub<any>[];
    ofPromise<A, T, State, Actions>(task: (args: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    ofFn<A, T, State, Actions>(task: (args: A) => void | T, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    ofSub<Actions>(sub: Sub<Actions>): Sub<Actions>[];
    batch<State, Actions>(...cmds: (Sub<Actions>[] | Sub<Actions>[][])[]): Sub<Actions>[];
    map<State, Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<SubActions>[]): Sub<Actions>[];
};
export default _default;
