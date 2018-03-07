import * as Cmd from './cmd';
declare global  {
    type Dt<T extends string, D = undefined> = {
        tag: T;
        data: D;
    } & {
        __tsTag: 'DateType';
    };
}
export declare function dt<T extends string, D = undefined>(tag: T, data?: D): Dt<T, D>;
export declare const never: (f: never) => never;
export declare const mkInit: <S, A>(state: S, cmd?: Cmd.Sub<A>[]) => () => [S, Cmd.Sub<A>[]];
