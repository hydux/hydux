
const isSet = val => typeof val !== 'undefined' && val !== null
const isPojo = obj => !isSet(obj.constructor) || obj.constructor === Object

export function set(to, from) {
  const keys = Object.keys(from)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    to[key] = from[key]
  }
  return to
}

export function merge(to, from) {
  return set(set(isPojo(to) ? {} : new to.constructor(), to), from)
}

export function setDeep(path: string[], value, from) {
  const to = isPojo(from) ? {} : new from.constructor()
  return 0 === path.length
    ? value
    : ((to[path[0]] =
        1 < path.length
          ? setDeep(path.slice(1), value, from[path[0]])
          : value),
      merge(from, to))
}

export function get(path: string[], from: any) {
  let len = path.length
  for (let i = 0; i < len; i++) {
    from = from[path[i]]
  }
  return from
}

export function isFn(data): data is Function {
  return 'function' === typeof data
}

export const noop = f => f
