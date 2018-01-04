import { ActionType, ActionsType } from './../../types'
import { AppProps, App, Init, View, Subscribe, OnUpdate } from './../../index'
import Cmd, { CmdType } from './../../cmd'
import { get, isFn } from '../../utils'
import { HistoryProps, BaseHistory, HashHistory, BrowserHistory } from './history'

export { HistoryProps, BaseHistory, HashHistory, BrowserHistory }
const ROUTE_ACTION = '@@hydux-router/CHANGE_LOCATION'
export interface Query { [key: string]: string | string[] }
export interface Location<P, Q extends Query> {
  template: string | null
  pathname: string,
  params: P,
  query: Q,
  search: string,
}

export interface History {
  push: (path: string) => void,
  replace: (path: string) => void,
  go: (delta: number) => void,
  back: () => void,
  forward: () => void,
}

export function parsePath<P, Q extends Query>(path: string): Location<P, Q> {
  const splits = path.split('?')
  const pathname = decodeURI(splits[0])
  const search = splits[1] ? '?' + splits[1] : ''
  const query = search.slice(1).split('&').filter(Boolean)
    .reduce((query, kv) => {
      const [key, value] = kv.split('=').map(decodeURIComponent)
      if (query[key]) {
        query[key] = Array.prototype.concat.call([], query[key], value)
      } else {
        query[key] = value || ''
      }
      return query
    }, {}) as Q
  return { pathname, params: {} as P, query, search, template: null }
}

const isNotEmpty = s => s !== ''

export function matchPath(pathname: string, fmt: string) {
  let paramKeys: string[] = []
  let re = '^' + fmt.replace(/\/$/, '').replace(/([.%|(){}\[\]])/g, '\\$1').replace('*', '.*').replace(/\/\:([\w]+)/g, (m, name) => {
    paramKeys.push(name)
    return '/([^/]+)'
  }) + '\/?$'
  let match = pathname.match(new RegExp(re))
  if (match) {
    const params = paramKeys.reduce(
      (params, key, i) =>
        ({ ...params, [key]: match && match[i + 1] }),
      {})
    return [true, params]
  } else {
    return [false, {}]
  }
}

export type RouterActions<Actions extends Object> = Actions & {
  history: History
}

export type RouterState<State extends Object> = State & {
  location: Location<any, any>
}

export function mkLink(history: History, h) {
  const React = { createElement: h }
  return function Link({ to, onClick, replace = false, ...props }: { to: string, onClick?: (e: MouseEvent) => void, replace?: boolean } , children) {
    function handleClick(e: MouseEvent) {
      if (replace) {
        history.replace(to)
      } else {
        history.push(to)
      }
      e.preventDefault()
      e.stopPropagation()
      onClick && onClick(e)
    }
    return <a href={to} {...props} onclick={handleClick} onClick={handleClick}>{children}</a>
  }
}

export type Routes<State, Actions> = {
  [key: string]: ActionType<Location<any, any>, State, Actions>
}

export interface RouterAppProps<State, Actions> extends AppProps<State, Actions> {
  view: View<RouterState<State>, RouterActions<Actions>>
  onUpdate?: OnUpdate<RouterState<State>, RouterActions<Actions>>,
}

export default function withRouter<State, Actions>(props: {
  history?: BaseHistory,
  routes?: Routes<State, Actions>,
} = {}) {
  const {
    history = new HashHistory(),
    routes = {},
  } = props
  let timer
  return (app: App<State, Actions>) => (props: RouterAppProps<State, Actions>) => {
    function pathToLoc(path) {
      const loc = parsePath<any, any>(path)
      for (const key in routes) {
        const [match, params] = matchPath(loc.pathname, key)
        if (match) {
          loc.params = params
          loc.template = key
          break
        }
      }
      return loc
    }
    return app({
      ...props,
      init: () => {
        let result = props.init()
        if (!(result instanceof Array)) {
          result = [result, Cmd.none]
        }

        const loc = pathToLoc(history.current())
        let cmd = result[1]
        if (loc) {
          cmd = Cmd.batch(
            result[1],
            Cmd.ofSub<RouterActions<Actions>>(
              actions => actions[ROUTE_ACTION](loc)
            )
          )
        }
        return [{ ...result[0] as any, location: loc }, cmd]
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<RouterActions<Actions>>(actions => {
          history.listen(path => {
            const loc = pathToLoc(path)
            actions[ROUTE_ACTION](loc)
          })
        }),
        props.subscribe ? props.subscribe(state) : Cmd.none
      ),
      actions: {
        ...(props.actions as any),
        history: ({
          push: path => (history.push(path), void 0),
          replace: path => (history.replace(path), void 0),
          go: (delta) => (history.go(delta), void 0),
          back: () => (history.back(), void 0),
          forward: () => (history.forward(), void 0),
        } as History),
        [ROUTE_ACTION]: (loc: Location<any, any>) => {
          if (loc.template) {
            return routes[loc.template](loc)
          } else {
            return state => ({ ...state, location: loc })
          }
        },
      }
    })
  }

}

export interface NestedRoutes<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
  children?: NestedRoutes<State, Actions>[],
}
export interface RouteInfo<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
}
export interface RouteMeta<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
  parents: RouteInfo<State, Actions>[],
  children: RouteInfo<State, Actions>[],
}

export interface RoutesMeta<State, Actions> {
  [key: string]: RouteMeta<State, Actions>
}

export function join(...args: string[]) {
  return args.join('/').replace(/\/+/g, '/')
}

/**
 * @param routes nested routes contains path, action, children, it would parse it to a `route` field (path:action map) for router enhancer, and a `meta` field which contains each route's parents.
 */
export function parseNestedRoutes<State, Actions>(routes: NestedRoutes<State, Actions>): {
  routes: Routes<State, Actions>,
  meta: RoutesMeta<State, Actions>,
} {
  function rec(routes: NestedRoutes<State, Actions>, newRoutes: {}): RoutesMeta<State, Actions> {
    let children = routes.children || []
    newRoutes[routes.path] = {
      ...routes,
      children: children.map(r => ({ ...r, parents: void 0, children: void 0 }))
    }
    children
      .map(r => ({
        ...r,
        path: join(routes.path, r.path),
        action: r.action,
        parents: ((routes as any).parents || []).concat({
          ...routes,
          parents: void 0,
          children: void 0,
        }),
        children: r.children,
      }))
      .forEach(r => rec(r, newRoutes))
    return newRoutes
  }
  const meta = rec(routes, {})
  let simpleRoutes = {} as Routes<State, Actions>
  for (const key in meta) {
    const route = meta[key]
    if (route.action) {
      simpleRoutes[key] = route.action
    }
  }
  return { routes: simpleRoutes, meta }
}
