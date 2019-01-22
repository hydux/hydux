import { ActionType, ActionsType, ActionType2 } from './../../types'
import {
  AppProps, App, Init, View, Subscribe,
  OnUpdate, runAction, Context, Patch,
  Component, normalize, ActionReturn
} from './../../index'
import { Dt, dt, never, CombinedComps } from '../../helpers'
import Cmd, { CmdType } from './../../cmd'
import { get, isFn, debug, error } from '../../utils'
import {
  HistoryProps, BaseHistory, HashHistory,
  BrowserHistory, MemoryHistory, MemoryHistoryProps,
  parsePath, matchPath
} from './history'
import { inject } from '../../dispatcher';

export { parsePath, matchPath }

export {
  HistoryProps, BaseHistory, HashHistory,
  BrowserHistory, MemoryHistory, MemoryHistoryProps,
  Context,
}
const CHANGE_LOCATION = '@@hydux-router/CHANGE_LOCATION'
export interface Param { [key: string]: string }
export interface Query { [key: string]: string | string[] }
export interface Location<P extends Param = Param, Q extends Query = Query> {
  template: string | null
  pathname: string
  params: P
  query: Q
  search: string
}

export interface History {
  push: (path: string) => void,
  replace: (path: string) => void,
  go: (delta: number) => void,
  back: () => void,
  forward: () => void,
}

export type RouterActions<Actions extends Object> = Actions & {
  history: History
}

export type RouterState<State extends Object, LazyComps = any> = State & {
  location: Location
  lazyComps: LazyComps
}

export interface LinkProps {
  to: string,
  onClick?: (e: any) => void,
  replace?: boolean,
  /** Prefetch splitted components, this will work only if you add code splitting first. */
  prefetch?: boolean,
  onMouseOver?: (e: any) => void
  onMouseOut?: (e: any) => void
  onTouchStart?: (e: any) => void
  className?: string
  onTouchEnd?: (e: any) => void
  onTouchMove?: (e: any) => void
  // Feel free to add more...
}

export function mkLink(history: History, h, opts: {
  comp?: string
} = {}) {
  const React = { createElement: h }
  return function Link({
      to,
      onClick,
      replace = false,
      prefetch = false,
      ...props
    }: LinkProps,
    children?: any
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
    const Comp: any = opts.comp || 'a'
    if ('children' in props) {
      children = (props as any).children
    }
    function handlePrefetch(e: any) {
      if (!prefetch) {
        return
      }
      const h = history as BaseHistory
      if (!h._routesMeta) {
        return console.error(`[hydux-router] Prefetch link requires passing nested routes to withRouter!`)
      }
      const loc = h.parsePath(to)
      if (loc.template) {
        const meta = h._routesMeta[loc.template]
        if (!meta || !meta.getComponent) {
          return console.error(`[hydux-router] Prefetch link requires code-splitting components as router component!`)
        }
        const [key, comp] = meta.getComponent()
        comp.then(() => {
          debug('router-link', `Component ${key} prefetched!`)
        })
      }
    }
    return (
      <Comp
        href={to}
        {...props}
        onMouseOver={e => {
          handlePrefetch(e)
          props.onMouseOver && props.onMouseOver(e)
        }}
        onTouchStart={e => {
          handlePrefetch(e)
          props.onTouchStart && props.onTouchStart(e)
        }}
        onClick={handleClick}
      >
        {children}
      </Comp>
    )
  }
}

export type Routes<State, Actions> = {
  [key: string]: ActionType<Location<any, any>, State, Actions>
}

export interface RouterAppProps<State, Actions> extends AppProps<State, Actions> {
  view: View<RouterState<State>, RouterActions<Actions>>
  onUpdated?: OnUpdate<RouterState<State>, RouterActions<Actions>>,
}

export type Options<S, A> = {
  history?: BaseHistory,
  /** Whether is running in SSR mode, used for code-splitting */
  ssr?: boolean,
  /** Whether is running in the server side, if `ssr` is true, used for code-splitting */
  isServer?: boolean,
  routes: Routes<S, A> | NestedRoutes<S, A>,
  hot?: boolean
}
let _hotListener = null as any
export default function withRouter<State, Actions>(props: Options<State, Actions> = { routes: {} }) {
  const {
    history = new HashHistory(),
    routes,
    ssr = false,
    isServer = typeof window === 'undefined' || (typeof self !== undefined && window !== self),
    hot = module['hot'],
  } = props
  let timer
  return (app: App<State, Actions>) => (props: RouterAppProps<State, Actions>) => {
    let routesMap: Routes<State, Actions> = routes as any
    let routesMeta = {} as any as RoutesMeta<State, Actions>
    if (('path' in routes) && typeof (routes as any).path === 'string') {
      const parsed = parseNestedRoutes<State, Actions>(routes as any)
      routesMap = parsed.routes
      routesMeta = parsed.meta
    }
    history._setRoutes(routesMap, routesMeta)
    const loc: Location<any, any> = history.location
    const meta = routesMeta[loc.template!]
    const getRouteComp = (meta?: RouteMeta<State, Actions>, fromInit = false): RouteComp<State, Actions> => {
      if (!meta || !meta.getComponent) {
        return dt('crossNormal', null)
      }
      const ret = meta.getComponent()
      const [key, comp] = ret
      let renderOnServer = true
      if (ret.length >= 3) {
        renderOnServer = ret[2] as boolean
      }
      if (ssr) {
        if (isServer && !renderOnServer) {
          return dt('crossNormal', null)
        }
        if (fromInit && !isServer && renderOnServer) {
          return dt('clientHydrate', { key, comp })
        }
      }
      return dt('crossDynamic', { key, comp })
    }
    let initComp = getRouteComp(meta, true)

    let isRenderable = false
    function runRoute<S, A>(routeComp: RouteComp<S, A>, actions: A, loc: Location) {
      const meta = routesMeta[loc.template!]
      switch (routeComp.tag) {
        case 'crossDynamic':
        case 'clientHydrate':
          const key = routeComp.data.key
          const isClientHydrate = routeComp.tag === 'clientHydrate'
          return routeComp.data.comp.then(
            comp => ctx.patch(key, comp, isClientHydrate)
          ).then(
            () => {
              if (isClientHydrate) { // trigger client ssr render
                isRenderable = true
                return ctx.render()
              }

              isRenderable = true
              return actions[CHANGE_LOCATION](loc) as CmdType<A>
            }
          )
        case 'crossNormal':
          isRenderable = true
          return actions[CHANGE_LOCATION](loc) as CmdType<A>
        default: return never(routeComp)
      }
    }
    const ctx = app({
      ...props,
      init: () => {
        let result = normalize(props.init())
        let cmd = Cmd.batch(
          result.cmd,
          Cmd.ofSub<RouterActions<Actions>>(
            actions => {
              const ar = runRoute(initComp, actions, loc)
              if (ar instanceof Promise) {
                return ar
              }
              return Promise.all(ar)
            }
          )
        )
        let state = { ...result.state as any, location: loc, lazyComps: {} } as RouterState<State>
        return { state, cmd }
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<RouterActions<Actions>>(actions => {
          let _listener = path => {
            const loc = history.location
            const meta = routesMeta[loc.template!]
            let comp = getRouteComp(meta, false)
            runRoute(comp, actions, loc)
            if (meta && meta.redirect) {
              setTimeout(() => {
                history.replace(meta.redirect!)
              })
            }
            console.log('router change')
          }
          if (hot) {
            const key = '@hydux-router/listener'
            if (_hotListener) {
              history.unlisten(_hotListener)
            }
            _hotListener = _listener
          }
          history.listen(_listener)
        }),
        props.subscribe ? props.subscribe(state) : Cmd.none
      ),
      actions: {
        ...props.actions as any,
        history: ({
          push: path => setTimeout(() => history.push(path)),
          replace: path => setTimeout(() => history.replace(path)),
          go: delta => setTimeout(() => history.go(delta)),
          back: () => setTimeout(() => history.back()),
          forward: () => setTimeout(() => history.forward()),
        } as History),
        [CHANGE_LOCATION]: (loc: Location<any, any>, resolve?: Function) => (state: State, actions: Actions) => {
          let ctx = inject()
          if (loc.template) {
            let action = routesMap[loc.template]
            let { state: nextState, cmd } = runAction(action(loc))
            ctx.setState({
              ...nextState as any,
              location: loc
            })
            ctx.addSub(...cmd)
          } else {
            ctx.setState({
              ...state as any,
              location: loc
            })
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
/**
 * patch and render dynamic component on the server or client
 */
| Dt<'crossDynamic', {key: string, comp: Promise<Component<S, A>>}>
/**
 * client hydrate for dynamic component on the client side
 */
| Dt<'clientHydrate', {key: string, comp: Promise<Component<S, A>>}>
/**
 * render as normal static component on the server or client
 */
| Dt<'crossNormal', null>

export type GetComp<S, A> = () =>
  | [string /** key */, Promise<Component<S, A>>]
  | [string /** key */, Promise<Component<S, A>>, boolean /** whether rendering on the server side, default is true */]

export interface NestedRoutes<State, Actions> {
  path: string,
  label?: string,
  // key?: keyof Actions
  // component?: Component<any, any>
  action?: ActionType<Location<any, any>, State, Actions>,
  children?: NestedRoutes<State, Actions>[],
  /**
   * Get a dynamic component, you need to return the key and the promise of the component, if you setup SSR, it would automatically rendered in the server side, but you can return a third boolean value to indicate whether rendering on the server side.
   * e.g.
   *  () =>
   *   | [string /** key *\/, Promise<Component<S, A>>]
   *   | [string /** key *\/, Promise<Component<S, A>>, boolean /** false to disable rendering on the server side *\/]
   */
  getComponent?: GetComp<any, any>
}
export interface RouteInfo<State, Actions> {
  path: string,
  label?: string,
  action?: ActionType<Location<any, any>, State, Actions>,
}
export interface RouteMeta<State, Actions> {
  path: string,
  redirect?: string
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
      .map(r => {
        let action = r.action
        return {
          ...r,
          path: join(routes.path, r.path),
          action,
          parents: ((routes as any).parents || []).concat({
            ...routes,
            parents: void 0,
            children: void 0,
          }),
          children: r.children,
        }
      })
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
