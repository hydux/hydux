import * as _fetch from 'isomorphic-fetch'
import * as Hydux from '../../../../src/index'
import * as State from './main/State'
import * as _Counter from './counter'

export function fetch(input: string, init?: RequestInit) {
  return _fetch('http://127.0.0.1:3456' + input, init)
}

// todo: Inject ctx in actions/views
export const global = {
  ctx: null as any as Hydux.Context<State.State, State.Actions, any, LazyComps>
}

export type LazyComps = {
  counter: typeof _Counter | null
}
