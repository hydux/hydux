import _app, { Cmd, Init, Context } from '../../../../../src/index'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory
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

export type State = {
  counter: _Counter.State,
  page: Page
}

const initState: State = (global as any).__INIT_STATE__ || {
  counter: null as any as _Counter.State,
  page: 'Home',
}

export const init: Init<State, Actions> = () => initState

export type Actions = typeof actions

export type Ctx = Context<State, Actions, any, Utils.LazyComps>

export const routes = (getCtx: () => Ctx): Routes<State, Actions> => {
  return {
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
      const ctx = getCtx()
      if (!ctx.lazyComps.counter) {
        return ctx.patch(
          'counter',
          ctx.lazyComps.counter = await import('../counter'),
        )
      }
    })],
    '*': loc => state => ({
      ...state,
      page: '404'
    })
  }
}
