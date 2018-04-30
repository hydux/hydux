import { Location, Query, RoutesMeta, Routes } from './index'
import { debug } from '../../utils'

export type HistoryProps = { basePath: string, initPath: string }

const isBrowser =
  typeof window !== 'undefined'
  && typeof location !== 'undefined'
  && typeof history !== 'undefined'

export function parsePath<P, Q extends Query>(path: string, tpls: string[]): Location<P, Q> {
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
  let template = null as null | string
  let params = {} as P
  for (const tpl of tpls) {
    const p = matchPath<P>(pathname, tpl)
    if (p) {
      params = p
      template = tpl
      break
    }
  }
  return {
    pathname,
    params,
    query,
    search,
    template,
  }
}

export function matchPath<P>(pathname: string, fmt: string): P | null {
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
      {}) as P
    return params
  }
  return null
}

export abstract class BaseHistory {
  public location: Location<any, any>
  public lastLocation: Location<any, any>
  public _routesMeta: RoutesMeta<any, any>
  protected props: HistoryProps
  protected _last: string[] = []
  protected listeners: ((path: string) => void)[] = []
  private _routes: Routes<any, any> = {}
  private _routesTpls: string[] = []
  constructor(props: Partial<HistoryProps> = {}) {
    this.props = props = { basePath: '', initPath: '/', ...props }
    this.listeners.push(path => {
      this._last = this._last.concat(path).slice(-2)
      this._updateLocation(path)
    })
    this.handleChange(this.props.initPath)
  }
  abstract realPath(path: string): string
  abstract get current(): string
  abstract push(path: string): void
  abstract replace(path: string): void
  get last() {
    return this._last[0] || this.props.initPath
  }
  listen = listener => this.listeners.push(listener)
  go(delta) {
    history.go(delta)
  }
  back() {
    history.back()
  }
  forward() {
    history.forward()
  }
  parsePath(path: string): Location<any, any> {
    return parsePath(path, this._routesTpls)
  }
  public _setRoutes(routes: Routes<any, any>, routesMeta: RoutesMeta<any, any>) {
    this._routesMeta = routesMeta
    this._routes = routes
    this._routesTpls = Object.keys(routes || {})
    this._updateLocation()
  }
  protected handleChange(path = this.current) {
    this.listeners.forEach(f => f(path))
  }
  private _updateLocation(path: string = this.current) {
    const loc = this.parsePath(path)
    this.lastLocation = this.location || loc
    this.location = loc
  }
}

export interface HashHistoryProps extends HistoryProps {
  hash: string
}

export class HashHistory extends BaseHistory {
  protected props: HashHistoryProps
  constructor(props: Partial<HashHistoryProps> = {}) {
    if (!isBrowser) {
      return new MemoryHistory() as any
    }
    super(props)
    this.props = props = {
      hash: '#!',
      ...this.props,
    }
    this._last = [this.current]
    window.addEventListener('hashchange', e => {
      this.handleChange()
    })
  }
  realPath(path: string) {
    return this.props.hash + this.props.basePath + path
  }
  get current() {
    return location.hash.slice(this.props.hash.length + this.props.basePath.length) || '/'
  }
  push(path) {
    location.assign(this.realPath(path))
  }
  replace(path) {
    location.replace(this.realPath(path))
  }
}

export class BrowserHistory extends BaseHistory {
  constructor(props: Partial<HistoryProps> = {}) {
    if (!isBrowser) {
      return new MemoryHistory(props)
    }
    super(props)
    this._last = [this.current]
    window.addEventListener('popstate', e => {
      this.handleChange()
    })
  }
  realPath(path: string) {
    return this.props.basePath + path
  }
  get current() {
    return location.pathname.slice(this.props.basePath.length)
    + location.search
  }
  push(path) {
    history.pushState(null, '', this.realPath(path))
    this.handleChange(path)
  }
  replace(path) {
    history.replaceState(null, '', this.realPath(path))
    this.handleChange(path)
  }
}
export interface MemoryHistoryProps extends HistoryProps {
  initPath: string
}
export class MemoryHistory extends BaseHistory {
  protected props: MemoryHistoryProps
  private _stack: string[] = []
  private _index: number = 0
  constructor(props: Partial<MemoryHistoryProps> = {}) {
    super(props)
    this.props = props = {
      ...this.props,
    }
    // Override initialization in super class
    this._stack = [this.props.basePath + this.props.initPath]
    this._last = [this.current]
  }
  realPath(path: string) {
    return this.props.basePath + path
  }
  get current() {
    return this._stack[this._index].slice(this.props.basePath.length)
  }
  push(path) {
    this._reset()
    this._stack.push(this.props.basePath + path)
    this.handleChange(path)
  }
  replace(path) {
    this._reset()
    this._stack[this._index] = this.props.basePath + path
    this.handleChange(path)
  }
  go(delta) {
    let next = this._index + delta
    next = Math.min(next, this._stack.length - 1)
    next = Math.max(next, 0)
    this._index = next
  }
  back() {
    this.go(-1)
  }
  forward() {
    this.go(1)
  }

  private _reset() {
    this._stack = this._stack.slice(0, this._index + 1)
  }
}
