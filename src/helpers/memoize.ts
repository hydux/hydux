
import { hashAny } from './hash'
import * as LRUCache from 'lru-cache'

let cache = new LRUCache<string, Function>({
  max: 100,
  maxAge: 10 * 60 * 1000
})

export function memoizeBind<A, Res>(
  callback: (a: A, ...args: any[]) => Res,
  a: A,
): (...args: any[]) => Res
export function memoizeBind<A, B, Res>(
  callback: (a: A, b: B, ...args: any[]) => Res,
   a: A, b: B,
): Res
export function memoizeBind<A, B, C, Res>(
  callback: (a: A, b: B, c: C, ...args: any[]) => Res,
  a: A, b: B, c: C,
): (...args: any[]) => Res
export function memoizeBind<A, B, C, D, Res>(
  callback: (a: A, b: B, c: C, d: D, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D,
): (...args: any[]) => Res
export function memoizeBind<A, B, C, D, E, Res>(
  callback: (a: A, b: B, c: C, d: D, e: E, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D, e: E,
): (...args: any[]) => Res
export function memoizeBind<A, B, C, D, E, F, Res>(
  callback: (a: A, b: B, c: C, d: D, e: E, f: F, ...args: any[]) => Res,
  a: A, b: B, c: C, d: D, e: E, f: F,
): (...args: any[]) => Res
export function memoizeBind(callback: (...args: any[]) => any, ...args) {
  const hashStr = args.concat(callback).map(hashAny).join('|')
  let cached = cache.get(hashStr)
  if (!cached) {
    cached = (...args2) => callback(...args, ...args2)
    cache.set(hashStr, cached)
  }
  return cached
}
/**
 * memoize stateless component (function component) via only one cache, it works like pure component.
 */
export function memoizeOne<P extends object, R>(fn: (props: P) => R, excludes = ['children']): ((props: P) => R) {
  let cache = null as any
  let hash = null as any
  return (props) => {
    let newHash = Object.keys(props)
      .sort()
      .filter(k => excludes.indexOf(k) < 0)
      .map(k => hashAny(props[k]))
      .join('|')
    if (newHash !== hash) {
      let r = fn(props)
      cache = r
      hash = newHash
    }
    return cache
  }
}

export function setCacheOptions(opts: LRUCache.Options) {
  cache = new LRUCache(opts)
}
