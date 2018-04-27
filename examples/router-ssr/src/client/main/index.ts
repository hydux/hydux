import * as Hydux from '../../../../../src/index'
import withReact, { React } from 'hydux-react'
import * as ReactDOM from 'react-dom/server'
import withSSR from '../../../../../src/enhancers/ssr'
import { ActionsType } from '../../../../../src/types'
import withRouter, {
  mkLink, History, HashHistory, BrowserHistory,
  RouterActions, RouterState, Routes, MemoryHistory
} from '../../../../../src/enhancers/router'
import * as Counter from '../counter'
import '../polyfill.ts'
import * as State from './State'
import * as View from './View'
import * as Utils from '../utils'
// const history = new HashHistory()
export function main(path?: string) {
  const noop = <T>(f: T) => f
  // NOTE: The order matters !!! If you are trying to integrate code splitting & SSR, you should ensure the enhancers order as ?withSSR -> withRouter -> ?withReact.
  let withEnhancers = Hydux.compose(
    __is_browser
      ? noop
      // Inject `renderToString` to Hydux on the server side, so we can call `ctx.render` to run all init commands and render the vdom to html string.
      : withSSR<State.State, State.Actions>({
        renderToString(view) {
          return ReactDOM.renderToString(view)
        },
      }),
    withRouter<State.State, State.Actions>({
      history:
        __is_browser
          ? State.history
          // Since there are no history API on the server side, we should use MemoryHistory here.
          : new MemoryHistory({ initPath: path }) ,
      routes: State.routes,
      ssr: true,
      isServer: !__is_browser,
    }),
    __is_browser
      ? withReact<State.State, State.Actions>(
        document.getElementById('root'),
        { hydrate: true },
      )
      : noop
  )
  let app = withEnhancers(Hydux.app)

  if (process.env.NODE_ENV === 'development' && __is_browser) {
    const devTools = require('hydux/lib/enhancers/devtools').default
    const logger = require('hydux/lib/enhancers/logger').default
    const hmr = require('hydux/lib/enhancers/hmr').default
    app = logger()(app)
    app = devTools()(app)
    app = hmr()(app)
  }
  // WithSSR would assume the app is running on the server side, so it won't render anything to the DOM, but will call renderToString when you call ctx.render()

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
