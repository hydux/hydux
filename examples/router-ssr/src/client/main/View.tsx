import withReact, { React } from 'hydux-react'
import { Context } from '../../../../../src/index'
import withRouter, {
  mkLink,
  History,
  HashHistory,
  BrowserHistory,
  RouterActions,
  RouterState,
  Routes,
} from '../../../../../src/enhancers/router'
import { State, Actions, history } from './State'
import * as Utils from '../utils'

const NoMatch = () => <div>404</div>
const Home = () => <div>Home</div>
const Users = () => <div>Users</div>

let Link = mkLink(history, React.createElement)

const renderRoutes = (state: State, actions: Actions) => {
  const Counter = state.lazyComps.counter
  switch (state.page) {
    case 'Home':
      return <div>Home</div>
    case 'Counter':
      console.log('client state', state)
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
export const root = (state: State, actions: RouterActions<Actions>) => (
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
    <Link className="counter" to="/counter" prefetch>Counter</Link>
    <Link className="e404" to="/404">404</Link>
    <div className="main">
      {renderRoutes(state, actions)}
    </div>
  </main>
)
