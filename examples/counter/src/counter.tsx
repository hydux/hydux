import { h, React } from '../../../src/enhancers/picodom-render'

const initState = { count: 0 }
const counter = {

  init: () => initState,
  actions: {
    down: _ => state => ({ count: state.count - 1 }),
    up: _ => state => ({ count: state.count + 2 })
  },
  view: (state: State) => (actions: Actions) =>
    <main>
      <h1>{state.count}</h1>
      <button onclick={actions.down}>–</button>
      <button onclick={actions.up}>+</button>
    </main>
}
export default counter
export type Actions = typeof counter.actions
export type State = typeof initState
