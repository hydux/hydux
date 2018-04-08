import * as _fetch from 'isomorphic-fetch'

export function fetch(input: string, init?: RequestInit) {
  return _fetch('http://127.0.0.1:3456' + input, init)
}
