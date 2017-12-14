import { HistoryProps } from './router'
import { ActionType, ActionsType } from './../types'
import { AppProps, App } from './../index'
import Cmd, { CmdType } from './../cmd'
import { get, isFunction } from '../utils'

const ROUTE_ACTION = '@@hydux-router/CHANGE_LOCATION'

export type Location<P, Q> = {
  template: string
  pathname: string,
  params: P,
  query: Q,
  search: string,
}

export function parsePath<P, Q>(path: string, fmt: string): Location<P, Q> | null {
  const splits = path.split('?')
  const pathname = splits[0]

  const fmtParts = fmt.split('/')
  const pathParts = pathname.split('/')
  const params = {} as P

  for (let i = 0; i < fmtParts.length; i++) {
    let part = fmtParts[i]
    if (i >= pathParts.length) {
      return null
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
        return null
      }
    } else if (part !== pathParts[i]) {
      return null
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

export abstract class BaseHistory {
  protected props: HistoryProps
  protected _last: string[]
  protected listeners: ((path: string) => void)[] = []
  constructor(props: Partial<HistoryProps> = {}) {
    this.props = { basePath: '', ...props }
    this._last = [this.current()]
    this.listeners.push(path => {
      this._last = this._last.slice(-1).concat(path)
    })
  }
  last = () => this._last[0]
  abstract current(): string
  abstract push(path: string): void
  abstract replace(path: string): void
  listen = listener => this.listeners.push(listener)
  go = delta => history.go(delta)
  back = () => history.back()
  forward = () => history.forward()
  protected handleChange(path = this.current()) {
    this.listeners.forEach(f => f(path))
  }
}

export type HashHistoryProps = HistoryProps & { hash: string }

export class HashHistory extends BaseHistory implements History {
  props: HashHistoryProps
  constructor(props: Partial<HashHistoryProps> = {}) {
    props = {
      hash: '#!',
      ...props,
    }
    super(props)
    this.props = {
      ...this.props,
      ...props,
    }
    window.addEventListener('hashchange', e => {
      console.log('hashchange', e)
      this.handleChange()
    })
  }
  current() {
    return location.hash.slice(this.props.hash.length + this.props.basePath.length)
  }
  push(path) {
    const url = this.props.hash + this.props.basePath + path
    console.log('assync', url)
    location.assign(url)
  }
  replace(path) {
    location.replace(this.props.hash + this.props.basePath + path)
  }
}

export interface History {
  push: (path: string) => void,
  replace: (path: string) => void,
  go: (delta: number) => void,
  back: () => void,
  forward: () => void,
}

export class BrowserHistory extends BaseHistory {
  constructor(props: HistoryProps) {
    super(props)
    window.addEventListener('popstate', e => {
      this.handleChange()
    })
  }
  current() {
    return location.pathname.slice(this.props.basePath.length)
    + location.search
  }

  push(path) {
    history.pushState(null, '', this.props.basePath + path)
    this.handleChange(path)
  }
  replace(path) {
    history.replaceState(null, '', this.props.basePath + path)
    this.handleChange(path)
  }
}

export type RouterActions<Actions extends Object> = Actions & {
  location: BaseHistory
}

export function mkLink(history: History, h) {
  const React = { createElement: h }
  return function Link(props, children) {
    function handleClick(e: MouseEvent) {
      console.log('handleClick', e)
      history.push(props.to)
      e.preventDefault()
      e.stopPropagation()
      props.onClick && props.onClick(e)
    }
    console.log('props', props)
    return <a href={props.to} {...props} onclick={handleClick} onClick={handleClick}>{children}</a>
  }
}

export type Routes<State, Actions> = {
  [key: string]: ActionType<Location<any, any>, State, Actions>
}

export default function withRouter<State, Actions>({
  history = new HashHistory(),
  routes = {},
}: {
  history?: BaseHistory,
  routes?: Routes<State, Actions>,
} = {}): (app: App<State, RouterActions<Actions>>) => App<State, RouterActions<Actions>> {
  let timer
  return (app: App<State, RouterActions<Actions>>) => (props: AppProps<State, RouterActions<Actions>>) => {
    function pathToLoc(path) {
      for (const key in routes) {
        const loc = parsePath<any, any>(path, key)
        if (loc) {
          return loc
        }
      }
      return null
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
              actions => (console.log('actions'), actions[ROUTE_ACTION](
                () => routes[loc.template](loc)
              ))
            )
          )
        }
        return [result[0], cmd]
      },
      subscribe: state => Cmd.batch(
        Cmd.ofSub<State, RouterActions<Actions>>(actions => {
          history.listen(path => {
            const loc = pathToLoc(path)
            console.log('listen', path, loc, actions)
            if (loc) {
              actions[ROUTE_ACTION](
                () => routes[loc.template](loc)
              )
            }
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
        [ROUTE_ACTION]: (action) => action(),
      }
    })
  }

}

type NestedRoutes<Actions> = {
  path: string,
  label?: string,
  action?: <T>(loc: Location<any, any>) => (actions: Actions) => void,
  parents?: NestedRoutes<Actions>[],
  children: NestedRoutes<Actions>[],
}

export function nestedRoutes<Actions>(routes: NestedRoutes<Actions>): {[key: string]: NestedRoutes<Actions>} {
  function rec(routes: NestedRoutes<Actions>, newRoutes: {}) {
    routes.children
      .map(r => ({
        path: routes.path + r.path,
        action: r.action,
        parent: (routes.parents || []).concat(r),
        children: r.children,
      }))
      .forEach(r => {
        if (!r.children.length) {
          newRoutes[r.path] = r
        } else {
          rec(r, newRoutes)
        }
      })
    return newRoutes
  }
  return rec(routes, {})
}
