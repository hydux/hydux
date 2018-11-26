
const isSet = <T>(val: T | undefined | null): val is T => typeof val !== 'undefined' && val !== null
export const isPojo = obj => !isSet(obj.constructor) || obj.constructor === Object

export const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
/** @internal */
export const debug = (key: string, ...args: any[]) => {
  isDev && console.log(`[hydux-${key}]`, ...args)
}
/** @internal */
export const error = (key: string, msg: string, ...args: any[]) => {
  console.error(`[hydux-${key}]`, msg, ...args)
  throw new TypeError(msg)
}

/** @public */
export function set<S>(to: S, from: Partial<S>): S {
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    to[key] = from[key]
  }
  return to
}

/** @public */
export function merge<S>(to: S, from: Partial<S>): S {
  return set(set(isPojo(to) ? {} : new (to as any).constructor(), to), from)
}

/** @public */
export function clone<S>(from: S): S {
  return set(isPojo(from) ? {} : new (from as any).constructor(), from)
}

/** @public */
export function setDeep<S, V>(path: string[], value: V, from: S): S {
  if (path.length === 0) {
    return value as any as S
  }
  let to = clone(from)
  let toCursor = to
  let fromCursor = from
  let lastIdx = path.length - 1
  set(toCursor, fromCursor)
  for (let i = 0; i < lastIdx; i++) {
    const key = path[i]
    toCursor = toCursor[key] = clone(toCursor[key])
    fromCursor = fromCursor[key]
    set(toCursor, fromCursor)
  }
  toCursor[path[lastIdx]] = value
  return to
}

/** @public */
export function setDeepMutable<S, V>(path: string[], value: V, from: S): S {
  let cursor = from
  for (let i = 0; i < path.length - 1; i++) {
    cursor = cursor[path[i]]
  }
  cursor[path[path.length - 1]] = value
  return from
}

/** @public */
export function get(path: string[], from: any, len: number = path.length) {
  if (len < 0) throw new TypeError('parameter len cannot be negative:' + len)
  for (let i = 0; i < len; i++) {
    from = from[path[i]]
  }
  return from
}

/** @public */
export function isFn(data): data is Function {
  return 'function' === typeof data
}

/** @public */
export const noop = f => f

/** @internal */
export const OverrideLength = '@hydux/override_length'

/** @internal */
export function weakVal<T, O = any>(obj: O, key: string, value?: T): T | void {
  if (isSet(value)) {
    Object.defineProperty(obj, key, {
      enumerable: false,
      value
    })
    return value
  } else {
    return obj[key]
  }
}
