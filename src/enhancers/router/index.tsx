import { ActionType, ActionsType, ActionType2 } from './../../types'
import {
  AppProps, App, Init, View, Subscribe,
  OnUpdate, runAction, Context, Patch,
  Component, normalizeInit
} from './../../index'
import { Dt, dt, never } from '../../helpers'
import Cmd, { CmdType } from './../../cmd'
import { get, isFn } from '../../utils'
import {
  HistoryProps, BaseHistory, HashHistory,
  BrowserHistory, MemoryHistory, MemoryHistoryProps,
} from './history'

export {
  HistoryProps, BaseHistory, HashHistory,
  BrowserHistory, MemoryHistory, MemoryHistoryProps,
  Context,
}
const CHANGE_LOCATION = '@@hydux-router/CHANGE_LOCATION'
export interface Query { [key: string]: string | string[] }
export interface Location<P = any, Q extends Query = any> {
  template: string | null
  pathname: string
  params: P
  query: Q
  search: string
  fromInit: boolean
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
  return { pathname, params: {} as P, query, search, template: null, fromInit: false }
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

export type RouterState<State extends Object, LazyComps = any> = State & {
  location: Location
  lazyComps: LazyComps
}

export function mkLink(history: History, h) {
  const React = { createElement: h }
  return function Link({
      to,
      onClick,
      replace = false,
      ...props,
    }: {
      to: string,
      onClick?: (e: any) => void,
      replace?: boolean,
    },
    children
  ) {
    function handleClick(e: any) {
      if (replace) {
        history.replace(to)
      } else {
        history.push(to)
      }
      e.preventDefault()
      e.stopPropagation()
      onClick && onClick(e)
    }
    const Comp: any = 'a'
    if ('children' in props) {
      children = (props as any).children
    }
    return (
      <a href={to} {...props} onClick={handleClick}>
      {children}
      </a>
    )
  }
}

export type Routes<State, Actions> = {
  [key: string]: ActionType2<Location<any, any>, Patch, State, Actions>
}

export interface RouterAppProps<State, Actions> extends AppProps<State, Actions> {
  view: View<RouterState<State>, RouterActions<Actions>>
  onUpdate?: OnUpdate<RouterState<State>, RouterActions<Actions>>,
}

export default function withRouter<State, Actions>(props: {
  history?: BaseHistory,
  routes: Routes<State, Actions> | NestedRoutes<State, Actions>,
} = { routes: {} }) {
  const {
    history = new HashHistory(),
    routes,
  } = props
  let timer
  return (app: App<State, Actions>) => (props: RouterAppProps<State, Actions>) => {
    let routesMap: Routes<State, Actions> = null as any
    let routesMeta = {} as any as RoutesMeta<State, Actions>
    if (('path' in routes) && typeof (routes as any).path === 'string') {
      const parsed = parseNestedRoutes<State, Actions>(routes as any)
      routesMap = parsed.routes
      routesMeta = parsed.meta
    }
    function pathToLoc(path) {
      const loc = parsePath<any, any>(path)
      for (const key in routesMap) {
        const [match, params] = matchPath(loc.pathname, key)
        if (match) {
          loc.params = params
          loc.template = key
          break
        }
      }
      return loc
    }
    const loc: Location<any, any> = pathToLoc(history.current())
    loc.fromInit = true
    const meta = routesMeta[loc.template!]
    let initComp = dt('none') as RouteComp<State, Actions>
    if (meta && meta.getComponent) {
      let _comp
      initComp = meta.getComponent(loc)
    }

    let isRenderable = true
    console.log('isRenderable', isRenderable)

    if (initComp.tag !== 'clientSSR') {
      isRenderable = false
      console.log('isRenderable', isRenderable)
    }
    function runRoute<S, A>(routeComp: RouteComp<S, A>, actions: A, loc: Location) {
      const meta = routesMeta[loc.template!]
      switch (routeComp.tag) {
        case 'normal':
        case 'dynamic':
        case 'clientSSR':
          const key = routeComp.data.key
          return routeComp.data.comp.then(
            comp => {
              isRenderable = true
              console.log('isRenderable', isRenderable)
              return ctx.patch(key, comp, routeComp.tag === 'clientSSR')
            }
          ).then(
            () => actions[CHANGE_LOCATION](loc)
          )
        case 'none': return
        default:
          return never(routeComp)
      }
    }
    const ctx = app({
      ...props,
      init: () => {
        let result = normalizeInit(props.init())
        let cmd = Cmd.batch(
          result[1],
          Cmd.ofSub<RouterActions<Actions>>(
            actions => runRoute(initComp, actions, loc)
          )
        )
        let state = { ...result[0] as any, location: loc, lazyComps: {} } as RouterState<State>
        return [state, cmd]
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<RouterActions<Actions>>(actions => {
          history.listen(path => {
            const loc = pathToLoc(path)
            const meta = routesMeta[loc.template!]
            if (meta && meta.getComponent) {
              const res = meta.getComponent(loc)
              runRoute(res, actions, loc)
            } else {
              actions[CHANGE_LOCATION](loc)
            }
          })
        }),
        props.subscribe ? props.subscribe(state) : Cmd.none
      ),
      actions: {
        ...props.actions as any,
        history: ({
          push: path => history.push(path),
          replace: path => history.replace(path),
          go: delta => history.go(delta),
          back: () => history.back(),
          forward: () => history.forward(),
        } as History),
        [CHANGE_LOCATION]: (loc: Location<any, any>, resolve?: Function) => (state: State, actions: Actions) => {
          history._setLoc(loc)
          if (loc.template) {
            const patch: Patch = (...args) => (ctx.patch as any)(...args)
            let [nextState, cmd] = runAction(routesMap[loc.template](loc, patch), state, actions)
            return [{ ...(nextState as any as object), location: loc }, cmd]
          } else {
            return { ...(state as any), location: loc }
          }
        },
      },
      onRender(view) {
        if (isRenderable) {
          props.onRender && props.onRender(view)
        }
      }
    })
    return ctx
  }
}

export type RouteComp<S, A> =
| Dt<'normal', {key: string, comp: Promise<Component<S, A>>}>
| Dt<'clientSSR', {key: string, comp: Promise<Component<S, A>>}>
| Dt<'dynamic', {key: string, comp: Promise<Component<S, A>>}>
| Dt<'none'>

export type GetComp<S, A> = (loc: Location<any, any>) => RouteComp<S, A>

export interface NestedRoutes<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
  children?: NestedRoutes<any, any>[],
  getComponent?: GetComp<State, Actions>
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
  getComponent?: GetComp<State, Actions>
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
      parents: (routes as any).parents || [],
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
      .forEach(r => rec(r as any, newRoutes))
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
