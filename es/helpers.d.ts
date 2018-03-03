import * as Cmd from './cmd';
declare global  {
    type Dt<T extends string, D = undefined> = {
        tag: T;
        data: D;
    };
}
export declare function dt<T extends string, D = undefined>(tag: T, data?: D): {
    tag: T;
    data: D | undefined;
};
export declare const never: (f: never) => never;
export declare const mkInit: <S, A>(state: S, cmd?: Cmd.Sub<A>[]) => [S, Cmd.Sub<A>[]];
