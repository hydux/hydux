import * as Hydux from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withUltradom, { h, React } from '../../../src/enhancers/ultradom-render'
import { ActionsType } from '../../../src/types'
import './polyfill.js'
import Intro from './intro'
import * as Counter from './counter'
import * as CounterInject from './counter-inject'

// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)
let app = withUltradom<State, Actions>()(Hydux.app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('../../../src/enhancers/devtools').default
  const logger = require('../../../src/enhancers/logger').default
  const hmr = require('../../../src/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

const subComps = Hydux.combine({
  counter1: [Counter, Counter.init()],
  counter2: [Counter, Counter.init()],
  counter3: [CounterInject, CounterInject.init()]
})
const actions = {
  ...subComps.actions,
  change: (e: MouseEvent) => (state: State) => ({ ...state, value: e.target!['value'] })
}
function init() {
  return {
    state: {
      ...subComps.state,
      value: ''
    },
    cmd: Hydux.Cmd.batch(
      subComps.cmd,
    )
  }
}

type Actions = typeof actions
type State = ReturnType<typeof init>['state']
const view = (state: State, actions: Actions) =>
    <main>
      <h1>Counter1:</h1>
      {Counter.view(state.counter1, actions.counter1)}
      <h1>Counter2:</h1>
      {Counter.view(state.counter2, actions.counter2)}
      <h1>Counter3(inject):</h1>
      {CounterInject.view(state.counter3, actions.counter3)}
      <Intro />
      <input value={state.value} onChange={actions.change} />
    </main>

export default app({
  init,
  actions,
  view,
})
