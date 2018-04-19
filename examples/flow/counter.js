// @flow

import { h, React } from '../../src/enhancers/ultradom-render'
import * as Hydux from '../../src/index'
import * as Cmd from '../../src/cmd'

const initState = { count: 0 }
const actions = {
  down: () => (state: State) => ({ count: state.count - 1 }),
  up: () => (state: State) => ({ count: state.count + 1 }),
  upN: (n: number) => (state: State) => ({ count: state.count + n }),
  upLater: (() => (state: State, actions: Actions) =>
    [ state,
      Cmd.ofPromise(
        n => {
          return new Promise(resolve =>
            setTimeout(() => resolve(n), 1000))
        },
        10,
        actions.upN) ])
}

const view = (state: State, actions: Actions) =>
  <div>
    <h1>{state.count}</h1>
    <button onclick={actions.down}>–</button>
    <button onclick={actions.up}>+</button>
    <button onclick={actions.upLater}>+ later</button>
  </div>

export default {
  initState: () => initState,
  initCmd: () => Cmd.none,
  actions,
  view,
}
export type Actions = typeof actions
export type State = typeof initState
