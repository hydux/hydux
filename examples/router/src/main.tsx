import _app, { inject, dt } from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withPicodom, { React } from '../../../src/enhancers/picodom-render'
import { ActionsType } from '../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes
} from '../../../src/enhancers/router'
import Counter, { State as CounterState } from './counter'
import './polyfill.js'

export const history = new HashHistory()

// const history = new BrowserHistory()
// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)
/**
 * Dispose history instance when hot reload, this can avoid lots of hmr bugs caused be memory leak.
 */
if (module['hot'] && module['hot'].dispose) {
  module['hot'].dispose(() => {
    history.dispose()
  })
}

const routes: Routes<State, Actions> = {
  '/': loc => {
    let ctx = inject<State, Actions>()
    ctx.setState({
      ...state,
      page: dt('Home', null),
    })
  },
  '/user/:id': loc => {
    let ctx = inject<State, Actions>()
    ctx.setState({
      ...state,
      page: dt('User', Number(loc.params.id))
    })
  },
  '/counter': loc => {
    let ctx = inject<State, Actions>()
    ctx.setState({
      ...state,
      page: dt('Counter', null)
    })
  },
  '/accounts': loc => {
    let ctx = inject<State, Actions>()
    ctx.setState({
      ...state,
      page: dt('Accounts', null)
    })
  },
  '*': loc => {
    let ctx = inject<State, Actions>()
    ctx.setState({
      ...state,
      page: dt('404', null),
    })
  }
}

let app = withPicodom<State, Actions>()(_app)
app = withRouter<State, Actions>({ history, routes })(app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('../../../src/enhancers/devtools').default
  const logger = require('../../../src/enhancers/logger').default
  const hmr = require('../../../src/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

let Link = mkLink(history, React.createElement)

const actions = {
  counter: Counter.actions,
}

type Page =
| Dt<'Home'>
| Dt<'Counter'>
| Dt<'User', number>
| Dt<'404'>
| Dt<'Accounts'>

type State = {
  counter: CounterState,
  page: Page
}

const state: State = {
  counter: Counter.init(),
  page: dt('Home', null),
}

type Actions = typeof actions
const NoMatch = () => <div class="main">404</div>

const renderRoutes = (state: State, actions: Actions) => {
  switch (state.page.tag) {
    case 'Home':
      return <div>Home</div>
    case 'Counter':
      return Counter.view(state.counter, actions.counter)
    case 'Accounts':
      return 'accounts'
    case '404':
      return '404'
    case 'User':
      return <div>User: {state.page.data}</div>
    default:
      return <NoMatch />
  }
}
const view = (state: State, actions: RouterActions<Actions>) => (
  <main>
    <style>{`
        a {
          margin-right: 5px;
        }
    `}</style>
    <h1>Router example</h1>
    <Link className="home" to="/">Home</Link>
    <Link className="users" to="/user/1">Users</Link>
    <Link className="accounts" to="/accounts">Accounts</Link>
    <Link className="counter" to="/counter">Counter</Link>
    <Link className="e404" to="/404">404</Link>
    <div className="main">
      {renderRoutes(state, actions)}
    </div>
  </main>
)

const ctx = app({
  init: () => state,
  actions,
  view,
})

if (process.env.NODE_ENV === 'development') {
  (window as any).ctx = ctx
}
