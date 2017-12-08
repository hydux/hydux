import { ActionType, ActionsType } from './../types'
import { AppProps, App } from './../index'
import Cmd, { CmdType } from './../cmd'
import { get } from '../utils'

export type MyAppProps<State, Actions> = AppProps<State, Actions> & {
  init: (page: any) => State | [State, CmdType<State, Actions>],
}

export type Router<P, Q> = {
  template: string
  pathname: string,
  params: P,
  query: Q,
  search: string,
}

function parsePath<P, Q>(path: string, fmt: string): Router<P, Q> | false {
  const splits = path.split('?')
  const pathname = splits[0]

  const fmtParts = fmt.split('/')
  const pathParts = pathname.split('/')
  const params = {} as P

  for (let i = 0; i < fmtParts.length; i++) {
    let part = fmtParts[i]
    if (i >= pathParts.length) {
      return false
    }
    let pathPart = decodeURI(pathParts[i])
    if (part.charAt(0) === ':') {
      params[part.slice(1)] = pathPart
    } else if (
      part.slice(-1, part.length) === '*' &&
      i === fmtParts.length - 1
    ) { // * in last part
      part = part.slice(0, -1)
      // match prefix
      if (part === pathParts[i].slice(0, part.length)) {
        break
      } else {
        return false
      }
    } else if (part !== pathParts[i]) {
      return false
    }
  }

  const search = splits[1] ? '?' + splits[1] : ''
  const query = search.slice(1).split('&').filter(Boolean)
    .reduce((query, kv) => {
      const [key, value] = kv.split('=').map(decodeURIComponent)
      if (query[key]) {
        query[key] = Array.prototype.concat.call(query[key], value)
      } else {
        query[key] = value || ''
      }
      return query
    }, {}) as Q
  return { pathname, params, query, search, template: fmt }
}

export type HistoryProps = { basePath: string }
export class BaseHistory {
  protected props: HistoryProps
  protected _last: string[]
  protected listeners: ((path: string) => void)[] = []
  constructor(props: HistoryProps = { basePath: '' }) {
    this.props = props
    this._last = [this.current()]
    this.listeners.push(path => {
      this._last = this._last.slice(-1).concat(path)
    })
  }
  last = () => this._last[0]
  current = () => ''
  watch = listener => this.listeners.push(listener)
  go = delta => history.go(delta)
  back = () => history.back()
  forward = () => history.forward()
  protected handleChange(path = this.current()) {
    this.listeners.forEach(f => f(path))
  }
}

export class HashHistory extends BaseHistory {
  constructor(props) {
    super(props)
    window.addEventListener('hashchange', () => {
      this.handleChange()
    })
  }
  current = () => location.hash.slice(2 + this.props.basePath.length)
  assign(path) {
    location.assign('#!' + this.props.basePath + path)
  }
  replace(path) {
    location.replace('#!' + this.props.basePath + path)
  }
}

export class BrowserHistory extends BaseHistory {
  constructor(props) {
    super(props)
    window.addEventListener('popstate', e => {
      this.handleChange()
    })
  }
  current = () =>
    location.pathname.slice(this.props.basePath.length)
    + location.search

  assign(path) {
    history.pushState(null, '', this.props.basePath + path)
    this.handleChange(path)
  }
  replace(path) {
    history.replaceState(null, '', this.props.basePath + path)
    this.handleChange(path)
  }
}
export type ActionsWithRoutes<Actions extends Object, RouterActions> = Actions & {
  routes: RouterActions,
  location: BaseHistory
}
export default function withRouter<State, Actions, RouterActions>({
  type = 'hash',
  basePath = '',
  routes = {
    // '/home': router => actions => actions.home()
  },
}: {
  type?: 'hash' | 'history',
  basePath?: string
  routes?: {[key: string]: (actions: RouterActions) => ActionType<Router<any, any>, State, ActionsWithRoutes<Actions, RouterActions>> },
} = {}): (app: App<State, ActionsWithRoutes<Actions, RouterActions>>) => App<State, ActionsWithRoutes<Actions, RouterActions>> {
  let timer
  const historyProps = { basePath }
  let history = type === 'history'
    ? new BrowserHistory(historyProps)
    : new HashHistory(historyProps)
  return (app: App<State, ActionsWithRoutes<Actions, RouterActions>>) => (props: MyAppProps<State, ActionsWithRoutes<Actions, RouterActions>>) => {
    return app({
      ...props,
      init: () => {
        return props.init('aaa')
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<State, ActionsWithRoutes<Actions, RouterActions>>(actions => {
          history.watch(path => {
            for (const key in routes) {
              const router = parsePath(path, key)
              if (router) {
                routes[key](actions.routes as any)(router)
              } else {
                break
              }
            }
          })
        }),
        props.subscribe ? props.subscribe(state) : Cmd.none
      ),
      actions: {
        ...(props.actions as any),
        location: history
      }
    })
  }

}
type NestedRoutes = {
  [key: string]: NestedRoutes | ({
    map: <T, U>(actions: T) => U,
    action: <T>(router: Router<any, any>) => any
  })
}
function isRoute(obj) {
  return (
    Object.keys(obj).length === 2 &&
    typeof obj.map === 'function' &&
    typeof obj.action === 'function'
  )
}
export function nestedRoutes(routes) {
  const newRoutes = {}
  const newActions = {}
  for (const key in routes) {
    let route = routes[key]
    if (isRoute(route)) {
      newRoutes[key] = route
    }
  }
}
