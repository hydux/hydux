import _app, { Cmd, Init, Context, dt, Dt, never } from '../../../../../src/index'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory,
  NestedRoutes, RouteComp
} from '../../../../../src/enhancers/router'
import * as _Counter from '../counter'
import * as Utils from '../utils'
// const history = new HashHistory()
export const history = new BrowserHistory()

export const actions = {
  counter: null as any as _Counter.Actions,
}

export type Page =
| 'Home'
| 'Counter'
| { page: 'User', id: number }
| '404'

let initState = {
  counter: null as any as _Counter.State,
  page: 'Home' as Page,
  // NOTE: `lazyComps` is a auto injected field contains all code-splitting components, you can define the type definitions to used in `view` function.
  lazyComps: {
    counter: undefined as typeof _Counter | void,
  }
}

initState = (global as any).__INIT_STATE__ || initState

export type State = typeof initState

export const init: Init<State, Actions> = () => {
  return {
    ...initState,
  }
}

export type Actions = typeof actions

export const routes: NestedRoutes<State, Actions> = {
  path: '/',
  action: loc => state => ({
    ...state,
    page: 'Home'
  }),
  children: [{
    path: '/user/:id',
    action: loc => state => ({
      ...state,
      page: {
        page: 'User',
        id: loc.params.id,
      }
    })
  }, {
    path: '/counter',
    getComponent: () => ['counter', import('../counter')],
    action: (loc, patch) => state => ({
      ...state,
      page: 'Counter'
    }),
  }, {
    path: '*',
    action: loc => state => ({
      ...state,
      page: '404'
    }),
  }]
}
