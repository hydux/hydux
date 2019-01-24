import _app, { Cmd, Dt, dt, never } from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withPicodom, { React } from '../../../src/enhancers/picodom-render'
import { ActionsType } from '../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, NestedRoutes
} from '../../../src/enhancers/router'
import * as _Counter from './counter'
import './polyfill.js'

// const history = new HashHistory()
const history = new BrowserHistory()
// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)

const routes: NestedRoutes<State, Actions> = {
  path: '/',
  action: loc => state => ({
    ...state,
    page: dt('Home', null)
  }),
  children: [{
    path: '/user/:id',
    action: loc => state => ({
      ...state,
      page: dt('User', Number(loc.params.id)),
    }),
  }, {
    path: '/counter',
    getComponent: () => ['counter', import('./counter')],
    action: loc => state => ({
      ...state,
      page: dt('Counter', null)
    }),
  }, {
    path: '*',
    action: loc => state => ({
      ...state,
      page: dt('404', null)
    })
  }]
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
| Dt<'Home'>
| Dt<'Counter'>
| Dt<'User', number>
| Dt<'404'>

const state = {
  counter: null as any as _Counter.State,
  page: dt('Home') as Page,
  // Auto injected field from router enhancer, for code-splitting components.
  lazyComps: {
    counter: null as typeof _Counter | null,
  }
}

type State = typeof state

type Actions = typeof actions
const NoMatch = () => <div>404</div>
const Home = () => <div>Home</div>
const Users = () => <div>Users</div>

const renderRoutes = (state: State, actions: Actions) => {
  const Counter = state.lazyComps.counter
  switch (state.page.tag) {
    case 'Home':
      return <div>Home</div>
    case 'Counter':
      if (Counter) {
        return Counter.view(state.counter, actions.counter)
      }
      return <div>Loading...</div>
    case '404':
      return <NoMatch />
    case 'User':
      return <div>User: {state.page.data}</div>
    default:
      never(state.page)
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
