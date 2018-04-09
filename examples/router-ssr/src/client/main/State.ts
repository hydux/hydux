import _app, { Cmd, Init } from '../../../../../src/index'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory
} from '../../../../../src/enhancers/router'
import * as Counter from '../counter'
// const history = new HashHistory()
export const history = new BrowserHistory()

export const actions = {
  counter: Counter.actions,
}

export type Page =
| 'Home'
| 'Counter'
| { page: 'User', id: number }
| '404'

export type State = {
  counter: Counter.State,
  page: Page
}

const initState: State = (global as any).__INIT_STATE__ || {
  counter: Counter.initState(),
  page: 'Home',
}

export const init: Init<State, Actions> = () => [
  initState,
  // Since the init command is already executed on the server side, we can simply ignore it on the browser side.
  __is_browser
    ? Cmd.none
    : Cmd.batch(
        Cmd.map(_ => _.counter, Counter.initCmd())
      )
]

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
