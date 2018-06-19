
const isSet = val => typeof val !== 'undefined' && val !== null
export const isPojo = obj => !isSet(obj.constructor) || obj.constructor === Object

export const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

export const debug = (key: string, ...args: any[]) => {
  isDev && console.log(`[hydux-${key}]`, ...args)
}

export function set<S>(to: S, from: Partial<S>): S {
  const keys = Object.keys(from)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    to[key] = from[key]
  }
  return to
}

export function merge<S>(to: S, from: Partial<S>): S {
  return set(set(isPojo(to) ? {} : new (to as any).constructor(), to), from)
}

export function clone<S>(from: S): S {
  return set(isPojo(from) ? {} : new (from as any).constructor(), from)
}

export function setDeep<S, V>(path: string[], value: V, from: S): S {
  if (path.length === 0) {
    return value as any as S
  }
  let to =
    isPojo(from)
      ? {} : new (from as any).constructor()
  let toCursor = to
  let fromCursor = from
  let lastIdx = path.length - 1
  set(toCursor, fromCursor)
  for (let i = 0; i < lastIdx; i++) {
    const key = path[i]
    toCursor = toCursor[key]
    fromCursor = fromCursor[key]
    set(toCursor, fromCursor)
  }
  toCursor[path[lastIdx]] = value
  return to
}

export function setDeepMutable<S, V>(path: string[], value: V, from: S): S {
  let cursor = from
  for (let i = 0; i < path.length - 1; i++) {
    cursor = cursor[path[i]]
  }
  cursor[path[path.length - 1]] = value
  return from
}

export function get(path: string[], from: any, len: number = path.length) {
  for (let i = 0; i < len; i++) {
    from = from[path[i]]
  }
  return from
}

export function isFn(data): data is Function {
  return 'function' === typeof data
}

export const noop = f => f
