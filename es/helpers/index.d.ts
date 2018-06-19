import * as Cmd from '../cmd';
export * from './hash';
export * from './memoize';
import { ActionReturn, ActionCmdReturn, StandardActionReturn, InitObjReturn } from '../types';
export declare type Dt<T extends string, D = null> = {
    tag: T;
    data: D;
} & {
    __tsTag: 'DateType';
};
/**
 * ADT Helper for TS
 * e.g.
 * ```ts
 * type Msg =
 * | Dt<'fetchBook', number>
 * | Dt<'updateBook', Book>
 *
 * let msg = dt('fetchBook', 1)
 * switch(msg.tag) {
 *   case 'fetchBook':
 *      //...
 *      break
 *   case 'updateBook':
 *      //...
 *      break
 *   default:
 *      never(msg.tag) // incomplete check from TS
 *      break
 * }
 * ```
 */
export declare function dt<T extends string, D = null>(tag: T, data?: D): Dt<T, D>;
export declare const never: (f: never) => never;
export declare function mkInit<S, A>(state: S, cmd?: Cmd.CmdType<A>): ActionCmdReturn<S, A>;
export declare type Fn1<T1, R> = (a1: T1) => R;
export declare function compose<T1, T2, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, T5, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, T5, T6, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, T6>, fn6: Fn1<T6, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, T5, T6, T7, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, T6>, fn6: Fn1<T6, T7>, fn7: Fn1<T7, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, T5, T6, T7, T8, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, T6>, fn6: Fn1<T6, T7>, fn7: Fn1<T7, T8>, fn8: Fn1<T8, R>): Fn1<T1, R>;
export declare function compose<T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, T6>, fn6: Fn1<T6, T7>, fn7: Fn1<T7, T8>, fn8: Fn1<T8, T9>, fn9: Fn1<T9, R>): Fn1<T1, R>;
export declare function combineInit<T extends {
    [k: string]: InitObjReturn<any, any>;
}, A extends {
    [k: string]: any;
}>(arg: T): {
    state: { [k in keyof T]: T[k]["state"]; };
    cmd: Cmd.Sub<A>[];
};
/**
 * run action and return a normalized result ([State, CmdType<>]),
 * this is useful to write High-Order-Action, which take an action and return a wrapped action.
 * @param result result of `action(msg: Data)`
 * @param state
 * @param actions
 */
export declare function runAction<S, A, PS, PA>(result: ActionReturn<S, A> | ((state: S, actions: A) => ActionReturn<S, A>), state: S, actions: A, parentState?: PS, parentActions?: PA): Required<StandardActionReturn<S, A>>;
export declare function withParents<S, A, PS, PA, A1>(action: (a1: A1) => (s: S, a: A) => any, wrapper?: (action: (a1: A1) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
export declare function withParents<S, A, PS, PA, A1, A2>(action: (a1: A1, a2: A2) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3>(action: (a1: A1, a2: A2, a3: A3) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3, A4>(action: (a1: A1, a2: A2, a3: A3, a4: A4) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
export declare function withParents<S, A, PS, PA, A1, A2, A3, A4, A5>(action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
/**
 * @deprecated Deprecated for `withParents`
 */
export declare const wrapActions: typeof withParents;
export declare function overrideAction<S, A, PS, PA, A1>(parentActions: PA, getter: (_: PA) => (a1: A1) => (s: S, a: A) => any, wrapper?: (action: (a1: A1) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;
