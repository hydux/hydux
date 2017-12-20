import { ActionType, ActionsType } from './../../types'
import { AppProps, App, Init, View, Subscribe, OnUpdate } from './../../index'
import Cmd, { CmdType } from './../../cmd'
import { get, isFunction } from '../../utils'
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
  return function Link(props, children) {
    function handleClick(e: MouseEvent) {
      history.push(props.to)
      e.preventDefault()
      e.stopPropagation()
      props.onClick && props.onClick(e)
    }
    return <a href={props.to} {...props} onclick={handleClick} onClick={handleClick}>{children}</a>
  }
}

export type Routes<State, Actions> = {
  [key: string]: ActionType<Location<any, any>, State, Actions>
}

export type AppProps<State, Actions> = {
  init: Init<State, Actions>,
  view: View<State, RouterActions<Actions>>
  actions: ActionsType<State, Actions>,
  subscribe?: Subscribe<RouterState<State>, RouterActions<Actions>>,
  // middlewares: ((action: MyAction<any, State, Actions>, key: string, path: string[]) => MyAction<any, State, Actions>)[],
  onRender?: (view: any) => void,
  onError?: (err: Error) => void,
  onUpdate?: OnUpdate<RouterState<State>, RouterActions<Actions>>,
}

export default function withRouter<State, Actions>({
  history = new HashHistory(),
  routes = {},
}: {
  history?: BaseHistory,
  routes?: Routes<State, Actions>,
} = {}) {
  let timer
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
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
            Cmd.ofSub<State, RouterActions<Actions>>(
              actions => actions[ROUTE_ACTION](loc)
            )
          )
        }
        return [{ ...result[0] as any, location: loc }, cmd]
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<State, RouterActions<Actions>>(actions => {
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
          push: path => history.push(path),
          replace: path => history.replace(path),
          go: (delta) => history.go(delta),
          back: () => history.back(),
          forward: () => history.forward(),
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
  parents?: NestedRoutes<State, Actions>[],
  children: NestedRoutes<State, Actions>[],
}

export interface ParsedNestedRoutes<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
  parents: NestedRoutes<State, Actions>[],
  children: NestedRoutes<State, Actions>[],
}

export interface NestedRoutesMeta<State, Actions> {
  [key: string]: ParsedNestedRoutes<State, Actions>
}
/**
 * @param routes nested routes like this:
 * ```js
 * const action = (loc: Location<any, any>) => ({}) // a action that take the location
 * {
 *   path: '/',
 *   children: [{
 *     path: '/general',
 *     label: 'General',
 *     action: action
 *     children: [{
 *       path: '/users',
 *       action: action
 *       label: 'User Management',
 *       children: []
 *     }],
 *   }, {
 *     path: '/about',
 *     label: 'About',
 *     action: action
 *     children: [],
 *   }]
 * }
 * // ==>
 * {
 *   routes: {
 *     '/general': action,
 *     '/general/users: action,
 *     '/about': action,
 *   },
 *   meta: {
 *     '/': {
 *        path: '/',
 *        parents: [],
 *        children: [],
 *     },
 *     '/general': {
 *        path: '/general',
 *        label: 'General',
 *        action: action,
 *        parents: [{
 *          path: '/',
 *          parents: [],
 *          children: [],
 *        }],
 *        children: [ ... ],
 *      },
 *     '/general/users: {
 *        path: '/users',
 *        label: 'User Management',
 *        action: action,
 *        parents: [{
 *          path: '/',
 *          parents: [],
 *          children: [],
 *        }, {
 *          path: '/general',
 *          label: 'User Management',
 *          action: action,
 *          parents: [],
 *          children: [],
 *        }],
 *        children: [ ... ],
 *      },
 *     '/about': {
 *        path: '/about',
 *        label: 'About',
 *        action: action
 *        children: [],
 *      },
 *   }
 * }
 * ```
 */
export function parseNestedRoutes<State, Actions>(routes: NestedRoutes<State, Actions>): {
  routes: Routes<State, Actions>,
  meta: NestedRoutesMeta<State, Actions>,
} {
  function rec(routes: NestedRoutes<State, Actions>, newRoutes: {}): NestedRoutesMeta<State, Actions> {
    newRoutes[routes.path] = routes
    routes.children
      .map(r => ({
        ...r,
        path: routes.path.replace(/\/$/, '') + '/' + r.path.replace(/^\//, ''),
        action: r.action,
        parents: (routes.parents || []).concat({
          ...routes,
          parents: [],
          children: [],
        }),
        children: r.children,
      }))
      .forEach(r => {
        rec(r, newRoutes)
      })
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
