import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory,
  NestedRoutes, RouteComp
} from '../../../../../src/enhancers/router'
import * as _Counter from '../counter'
import * as Counter2 from '../counter2'
import * as Utils from '../utils'
import { Dt, dt, combine, Init, inject } from '../../../../../src/index'
// const history = new HashHistory()
export const history = new BrowserHistory()

if (module.hot && module.hot.dispose) {
  module.hot.dispose(() => history.dispose())
}

export const subComps = combine({
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
| Dt<'home'>
| Dt<'counter'>
| Dt<'counter2'>
| Dt<'counter3'>
| Dt<'user', number>
| Dt<'404'>

let initState = {
  counter: null as any as _Counter.State,
  home: null,
  user: null,
  ...subComps.state,
  page: dt('home') as Page,
  // NOTE: `lazyComps` is an auto injected field contains all code-splitting components, you can define the type definitions to used in `view` function.
  lazyComps: {
    counter: undefined as typeof _Counter | void,
  }
}
export const isSSR = !!(global as any).__INIT_STATE__
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
    page: dt('home', null)
  }),
  children: [{
    path: '/user/:id',
    action(loc) {
      let ctx = inject<State, Actions>()
      ctx.setState({
        ...ctx.state,
        page: dt('user', Number(loc.params.id)),
      })
    }
  }, {
    path: '/counter',
    getComponent: () => ['counter', import('../counter')],
    action(loc) {
      let ctx = inject<State, Actions>()
      ctx.setState({
        page: dt('counter', null)
      })
    },
  }, {
    path: '/counter2',
    action(loc) {
      let ctx = inject<State, Actions>()
      ctx.setState({
        page: dt('counter2', null)
      })
      .addSub(...subComps.cmds.counter2)
    },
  }, {
    path: '/counter3',
    action(loc) {
      let ctx = inject<State, Actions>()
      ctx.setState({
        page: dt('counter3', null)
      })
      .addSub(...subComps.cmds.counter3)
    },
  }, {
    path: '*',
    action(loc) {
      let ctx = inject<State, Actions>()
      ctx.setState({ page: dt('404', null) })
    },
  }]
}
