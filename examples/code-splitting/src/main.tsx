import _app, { Cmd } from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withPicodom, { React } from '../../../src/enhancers/picodom-render'
import { ActionsType } from '../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes
} from '../../../src/enhancers/router'
import * as _Counter from './counter'
import './polyfill.js'

let Counter = null as typeof _Counter | null

// const history = new HashHistory()
const history = new BrowserHistory()
// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)

const routes: Routes<State, Actions> = {
  '/': loc => state => ({
    ...state,
    page: 'Home'
  }),
  '/user/:id': loc => state => ({
    ...state,
    page: {
      page: 'User',
      id: loc.params.id,
    }
  }),
  '/counter': loc => state => [({
    ...state,
    page: 'Counter'
  }), Cmd.ofSub(async _ => {
    if (!Counter) {
      Counter = await import('./counter')
      return ctx.patch('counter', Counter)
    }
  }) ],
  '*': loc => state => ({
    ...state,
    page: '404'
  })
}

let app = withRouter<State, Actions>({ history, routes })(_app)
app = withPicodom<State, Actions>()(app)

if (process.env.NODE_ENV === 'development') {
  const devTools = require('hydux/lib/enhancers/devtools').default
  const logger = require('hydux/lib/enhancers/logger').default
  const hmr = require('hydux/lib/enhancers/hmr').default
  app = logger()(app)
  app = devTools()(app)
  app = hmr()(app)
}

let Link = mkLink(history, React.createElement)

const actions = {
  counter: null as any as _Counter.Actions,
}

type Page =
| 'Home'
| 'Counter'
| { page: 'User', id: number }
| '404'

type State = {
  counter: _Counter.State,
  page: Page
}

const state: State = {
  counter: null as any,
  page: 'Home',
}

type Actions = typeof actions
const NoMatch = () => <div>404</div>
const Home = () => <div>Home</div>
const Users = () => <div>Users</div>

const renderRoutes = (state: State, actions: Actions) => {
  switch (state.page) {
    case 'Home':
      return <div>Home</div>
    case 'Counter':
      if (Counter) {
        return Counter.view(state.counter, actions.counter)
      }
      return <div>Loading...</div>
    case '404':
      return <NoMatch />
    default:
      switch (state.page.page) {
        case 'User':
          return <div>User: {state.page.id}</div>
      }
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
    <Link to="/">Home</Link>
    <Link to="/user/1">Users</Link>
    <Link to="/accounts">Accounts</Link>
    <Link to="/counter">Counter</Link>
    <Link to="/404">404</Link>
    {renderRoutes(state, actions)}
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
