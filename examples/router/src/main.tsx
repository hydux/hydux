import _app from '../../../src/index'
import withPersist from '../../../src/enhancers/persist'
import withPicodom, { React } from '../../../src/enhancers/picodom-render'
import { ActionsType } from '../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes
} from '../../../src/enhancers/router'
import Counter, { State as CounterState } from './counter'
import './polyfill.js'
// const history = new HashHistory()
const history = new BrowserHistory()
// let app = withPersist<State, Actions>({
//   key: 'time-game/v1'
// })(_app)

const routes: Routes<State, Actions> = {
  '/': loc => state => ({
    ...state,
    page: {
      page: 'Home',
      data: { text: 'aaa' },
    }
  }),
  '/user/:id': loc => state => ({
    ...state,
    page: {
      page: 'User',
      data: { user: { name: 'xxx', id: loc.params.id } },
    }
  }),
  '/counter': loc => state => ({
    ...state,
    page: {
      page: 'Counter',
      data: Counter.init(),
    }
  }),
  '*': loc => state => ({
    ...state,
    page: {
      page: '404',
      data: null,
    }
  })
}

let app = withRouter<State, Actions>({ history, routes })(_app)
app = withPicodom()(app)

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
  counter: Counter.actions,
}
type HomeState = {
  text: string
}
type UserState = {
  user: { name: string, id: string }
}
type Page =
| { page: 'Home', data: HomeState }
| { page: 'User', data: UserState }
| { page: 'Counter', data: CounterState }
| { page: '404', data: null }

type State = {
  counter: CounterState,
  page: Page
}

const state: State = {
  counter: Counter.init(),
  page: { page: 'Home', data: { text: 'Home' } },
}

type Actions = typeof actions
const NoMatch = () => <div>404</div>
const Home = () => <div>Home</div>
const Users = () => <div>Users</div>

const renderRoutes = (page: Page) => (actions: Actions) => {
  switch (page.page) {
    case 'Home':
      return <div>{page.data.text}</div>
    case 'User':
      return <div>{page.data.user.name}({page.data.user.id})</div>
    case 'Counter':
      return Counter.view(page.data)(actions.counter)
    case '404':
      return <NoMatch />
  }
}
const view = (state: State) => (actions: RouterActions<Actions>) => (
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
    {renderRoutes(state.page)(actions)}
  </main>
)

export default app({
  init: () => state,
  actions,
  view,
})
