import _app from '../../../../../src/index'
import withPicodom, { React } from '../../../../../src/enhancers/picodom-render'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory
} from '../../../../../src/enhancers/router'
import Counter, { State as CounterState } from '../counter'
// const history = new HashHistory()
export const history =
  __is_browser
    ? new BrowserHistory()
    : new MemoryHistory()

export const actions = {
  counter: Counter.actions,
}

export type Page =
| 'Home'
| 'Counter'
| { page: 'User', id: number }
| '404'

export type State = {
  counter: CounterState,
  page: Page
}

const initState: State = {
  counter: Counter.init(),
  page: 'Home',
}

export const init = () => initState

export type Actions = typeof actions

export const routes: Routes<State, Actions> = {
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
  '/counter': loc => state => ({
    ...state,
    page: 'Counter'
  }),
  '*': loc => state => ({
    ...state,
    page: '404'
  })
}
