export declare type Dt<T extends string, D = undefined> = {
    tag: T;
    data: D;
};
export declare function dt<T extends string, D = undefined>(tag: T, data?: D): {
    tag: T;
    data: D | undefined;
};
export declare const never: (f: never) => never;
