import * as Hydux from '../../../../../src/index'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory,
  NestedRoutes, RouteComp
} from '../../../../../src/enhancers/router'
import * as _Counter from '../counter'
import * as Counter2 from '../counter2'
import * as Utils from '../utils'
// const history = new HashHistory()
export const history = new BrowserHistory()

export const subComps = Hydux.combine({
  counter2: [Counter2, Counter2.init(`Counter2`)],
  counter3: [Counter2, Counter2.init(`Counter3`)],
  counter4: [Counter2, Counter2.init(`Counter4`)],
})

export const actions = {
  counter: null as any as _Counter.Actions,
  home: null as any,
  user: null as any,
  ...subComps.actions,
}

export type Page =
| 'home'
| 'counter'
| 'counter2'
| 'counter3'
| { page: 'user', id: number }
| '404'

let initState = {
  counter: null as any as _Counter.State,
  home: null,
  user: null,
  ...subComps.state,
  page: 'home' as Page,
  // NOTE: `lazyComps` is an auto injected field contains all code-splitting components, you can define the type definitions to used in `view` function.
  lazyComps: {
    counter: undefined as typeof _Counter | void,
  }
}
export const isSSR = !!(global as any).__INIT_STATE__
initState = (global as any).__INIT_STATE__ || initState

export type State = typeof initState

export const init: Hydux.Init<State, Actions> = () => {
  return {
    ...initState,
  }
}

export type Actions = typeof actions

export const routes: NestedRoutes<State, Actions> = {
  path: '/',
  action: loc => state => ({
    ...state,
    page: 'home'
  }),
  children: [{
    path: '/user/:id',
    action: loc => state => ({
      ...state,
      page: {
        page: 'user',
        id: loc.params.id,
      }
    })
  }, {
    path: '/counter',
    getComponent: () => ['counter', import('../counter')],
    action: (loc) => state => ({
      page: 'counter'
    }),
  }, {
    path: '/counter2',
    update: (loc) => ({
      state: {
        page: 'counter2'
      },
      cmd: subComps.cmds.counter2,
    }),
  }, {
    path: '/counter3',
    update: (loc) => ({
      state: {
        page: 'counter3'
      },
      cmd: subComps.cmds.counter2,
    }),
  }, {
    path: '*',
    action: loc => state => ({
      ...state,
      page: '404'
    }),
  }]
}
