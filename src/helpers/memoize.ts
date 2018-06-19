
import { hashAny } from './hash'
import * as LRUCache from 'lru-cache'

let cache = new LRUCache<string, Function>({
  max: 100,
  maxAge: 10 * 60 * 1000
})

export function memoize<A, Res>(
  callback: (a: A, ...args: any[]) => Res,
  a: A,
): (...args: any[]) => Res
export function memoize<A, B, Res>(
  callback: (a: A, b: B, ...args: any[]) => Res,
   a: A, b: B,
): Res
export function memoize<A, B, C, Res>(
  callback: (a: A, b: B, c: C, ...args: any[]) => Res,
  a: A, b: B, c: C,
): (...args: any[]) => Res
export function memoize<A, B, C, D, Res>(
  callback: (a: A, b: B, c: C, d: D, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D,
): (...args: any[]) => Res
export function memoize<A, B, C, D, E, Res>(
  callback: (a: A, b: B, c: C, d: D, e: E, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D, e: E,
): (...args: any[]) => Res
export function memoize<A, B, C, D, E, F, Res>(
  callback: (a: A, b: B, c: C, d: D, e: E, f: F, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D, e: E, f: F,
): (...args: any[]) => Res
export function memoize(callback: (...args: any[]) => any, ...args) {
  const hashStr = args.concat(callback).map(hashAny).join('|')
  let cached = cache.get(hashStr)
  if (!cached) {
    cached = (...args2) => callback(...args, ...args2)
    cache.set(hashStr, cached)
  }
  return cached
}

export function setCacheOptions(opts: LRUCache.Options) {
  cache = new LRUCache(opts)
}
