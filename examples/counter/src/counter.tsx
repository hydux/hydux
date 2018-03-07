import { h, React } from '../../../src/enhancers/picodom-render'
// import { Cmd, noop, ActionsType, ActionType } from '../../../src/index'
import * as Hydux from '../../../src/index'
const { Cmd } = Hydux

const initState = { count: 0 }
const actions = {
  down: () => state => ({ count: state.count - 1 }),
  up: () => state => ({ count: state.count + 1 }),
  upN: n => state => ({ count: state.count + n }),
  upLater: (() => (state) => (actions) =>
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
