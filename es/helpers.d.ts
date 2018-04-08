import * as Cmd from './cmd';
declare global  {
    type Dt<T extends string, D = undefined> = {
        tag: T;
        data: D;
    } & {
        __tsTag: 'DateType';
    };
}
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
export declare function dt<T extends string, D = undefined>(tag: T, data?: D): Dt<T, D>;
export declare const never: (f: never) => never;
export declare const mkInit: <S, A>(state: S, cmd?: Cmd.Sub<A>[]) => () => [S, Cmd.Sub<A>[]];
