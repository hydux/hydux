import * as LRUCache from 'lru-cache';
export declare function memoize<A, Res>(callback: (a: A, ...args: any[]) => Res, a: A): (...args: any[]) => Res;
export declare function memoize<A, B, Res>(callback: (a: A, b: B, ...args: any[]) => Res, a: A, b: B): Res;
export declare function memoize<A, B, C, Res>(callback: (a: A, b: B, c: C, ...args: any[]) => Res, a: A, b: B, c: C): (...args: any[]) => Res;
export declare function memoize<A, B, C, D, Res>(callback: (a: A, b: B, c: C, d: D, ...args: any[]) => Res, a: A, b: B, c: C, d: D): (...args: any[]) => Res;
export declare function memoize<A, B, C, D, E, Res>(callback: (a: A, b: B, c: C, d: D, e: E, ...args: any[]) => Res, a: A, b: B, c: C, d: D, e: E): (...args: any[]) => Res;
export declare function memoize<A, B, C, D, E, F, Res>(callback: (a: A, b: B, c: C, d: D, e: E, f: F, ...args: any[]) => Res, a: A, b: B, c: C, d: D, e: E, f: F): (...args: any[]) => Res;
export declare function setCacheOptions(opts: LRUCache.Options): void;
