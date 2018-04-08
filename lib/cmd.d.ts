import { ActionType } from './types';
export interface Sub<Actions> {
    (actions: Actions): any;
}
export declare type CmdType<Actions> = Sub<Actions>[];
/**
 * Create command from a function has side effects.
 * @param task A function has one or zero paramter.
 * @param args Optional, the parameter of the funciton
 * @param succeedAction An action that would executed after the function executed.
 * @param failedAction An action that would executed after the function throw an error.
 */
export declare function ofFn<A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare function ofFn<A, T, State, Actions>(task?: () => T, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
/**
 * Create a command from promise
 * @param task A function that take one or zero parameter and return a promise.
 * @param args Optional, the paramter of task
 * @param succeedAction An action would execute when the promise fulfilled.
 * @param failedAction An action would execute when the promise rejected.
 */
export declare function ofPromise<A, T, State, Actions>(task: (arg: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
export declare function ofPromise<A, T, State, Actions>(task: () => Promise<T>, succeedAction?: ActionType<T, State, Actions>, failedAction?: ActionType<Error, State, Actions>): CmdType<Actions>;
/**
 * Create a command from a sub function, you can access all same level actions in a `sub`.
 * @param sub
 */
export declare const ofSub: <Actions>(sub: Sub<Actions>) => Sub<Actions>[];
/**
 * Batch multi commands to one command
 * @param cmds
 */
export declare const batch: <Actions>(...cmds: (Sub<Actions>[] | Sub<Actions>[][])[]) => Sub<Actions>[];
/**
 * Map a command to a low level command
 * @param map
 * @param cmd
 */
export declare const map: <Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<SubActions>[]) => Sub<Actions>[];
/**
 * Empty command
 */
export declare const none: Sub<any>[];
export declare const Cmd: {
    none: Sub<any>[];
    ofFn: {
        <A, T, State, Actions>(task: (args: A) => T, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
        <A, T, State, Actions>(task?: (() => T) | undefined, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    };
    ofPromise: {
        <A, T, State, Actions>(task: (arg: A) => Promise<T>, args: A, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
        <A, T, State, Actions>(task: () => Promise<T>, succeedAction?: ActionType<T, State, Actions> | undefined, failedAction?: ActionType<Error, State, Actions> | undefined): Sub<Actions>[];
    };
    ofSub: <Actions>(sub: Sub<Actions>) => Sub<Actions>[];
    batch: <Actions>(...cmds: (Sub<Actions>[] | Sub<Actions>[][])[]) => Sub<Actions>[];
    map: <Actions, SubActions>(map: (action: Actions) => SubActions, cmd: Sub<SubActions>[]) => Sub<Actions>[];
};
export default Cmd;
