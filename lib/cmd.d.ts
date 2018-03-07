import { ActionType } from './types';
export interface Sub<Actions> {
    (actions: Actions): any;
}
export declare type CmdType<Actions> = Sub<Actions>[];
export declare function ofFn<A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare function ofFn<A, T, State, Actions>(task?: () => T, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare function ofPromise<A, T, State, Actions>(task: (arg: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare function ofPromise<A, T, State, Actions>(task?: () => Promise<T>, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare const ofSub: <Actions>(sub: Sub<Actions>) => Sub<Actions>[];
export declare const batch: <Actions>(...cmds: (Sub<any>[] | Sub<any>[][])[]) => Sub<Actions>[];
export declare const map: <Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<SubActions>[]) => Sub<Actions>[];
export declare const none: Sub<any>[];
export declare const Cmd: {
    none: Sub<any>[];
    ofFn: {
        <A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
        <A, T, State, Actions>(task?: (() => T) | undefined, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    };
    ofPromise: {
        <A, T, State, Actions>(task: (arg: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
        <A, T, State, Actions>(task?: (() => Promise<T>) | undefined, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    };
    ofSub: <Actions>(sub: Sub<Actions>) => Sub<Actions>[];
    batch: <Actions>(...cmds: (Sub<any>[] | Sub<any>[][])[]) => Sub<Actions>[];
    map: <Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<SubActions>[]) => Sub<Actions>[];
};
export default Cmd;
