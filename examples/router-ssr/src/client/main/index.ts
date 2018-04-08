import _app from '../../../../../src/index'
import withPicodom, { React } from '../../../../../src/enhancers/picodom-render'
import withSSR from '../../../../../src/enhancers/ssr'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory
} from '../../../../../src/enhancers/router'
import Counter, { State as CounterState } from '../counter'
import '../polyfill.ts'
import * as State from './State'
import * as View from './View'
// const history = new HashHistory()

export function main(path?: string) {
  let app = withPicodom<State.State, State.Actions>()(
    withRouter<State.State, State.Actions>({
      history: __is_browser
        ? State.history
        // Since there are no history API on the server side, we should use MemoryHistory here.
        : new MemoryHistory({ initPath: path }) ,
      routes: State.routes
    })(_app)
  )

  if (process.env.NODE_ENV === 'development' && __is_browser) {
    const devTools = require('hydux/lib/enhancers/devtools').default
    const logger = require('hydux/lib/enhancers/logger').default
    const hmr = require('hydux/lib/enhancers/hmr').default
    app = logger()(app)
    app = devTools()(app)
    app = hmr()(app)
  }
  // WithSSR would assume the app is running on the server side, so it won't render anything to the DOM, but will call renderToString when you call ctx.render()
  if (!__is_browser) {
    app = withSSR<State.State, State.Actions>({
      renderToString(view) {
        return ''
      }
    })(app)
  }

  const ctx = app({
    init: State.init,
    actions: State.actions,
    view: View.root,
  })

  if (__dev) {
    (window as any).ctx = ctx
  }
  return ctx
}

if (__is_browser) {
  main()
}
