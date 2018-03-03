import _app from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withUltradom, { h, React } from '../../../src/enhancers/ultradom-render'
import { ActionsType } from '../../../src/types'
import './polyfill.js'
import Intro from './intro'
import Counter, { State as CounterState, Actions as CounterActions } from './counter'

// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)
let app = withUltradom<State, Actions>()(_app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('../../../src/enhancers/devtools').default
  const logger = require('../../../src/enhancers/logger').default
  const hmr = require('../../../src/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

const actions = {
  counter1: Counter.actions,
  counter2: Counter.actions,
  change: (e: MouseEvent) => (state: State) => ({ ...state, value: e.target['value'] })
}

const state = {
  counter1: Counter.init(),
  counter2: Counter.init(),
  value: '',
}

type Actions = typeof actions
type State = typeof state
const view = (state: State, actions: Actions) =>
    <main>
      <h1>Counter11:</h1>
      {Counter.view(state.counter1, actions.counter1)}
      <h1>Counter2:</h1>
      {Counter.view(state.counter2, actions.counter2)}
      <Intro />
      <input value={state.value} onChange={actions.change} />
    </main>

export default app({
  init: () => state,
  actions,
  view,
})
